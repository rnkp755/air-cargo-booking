import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import { UserLoginSchema, UserLoginInput } from "@/types/user";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken, verifyPassword } from "@/lib/utils/auth";

export const POST = asyncHandler(async (req: Request) => {
    const body: UserLoginInput = await validateBody(req, UserLoginSchema);

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

    if (!user) {
        return NextResponse.json(
            new APIResponse(false, "Invalid email or password"), { status: 401 }
        );
    }

    const isPasswordValid = await verifyPassword(body.password, user.password);
    if (!isPasswordValid) {
        return NextResponse.json(
            new APIResponse(false, "Invalid email or password"), { status: 401 }
        );
    }

    const accessToken = await generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken = await generateRefreshToken(user.id);

    // Store refresh token in the database
    await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));

    // set HttpOnly cookie for refresh token
    const response = NextResponse.json(
        new APIResponse(true, "User logged in successfully", {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        })
    );

    response.cookies.set(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            secure: true,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        }
    );
    response.cookies.set(
        "accessToken",
        accessToken,
        {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60, // 15 minutes
        }
    );
    return response;
});
