import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import { UserSignupSchema, UserSignupInput } from "@/types/user";
import { hashPassword } from "@/lib/utils/auth";

export const POST = asyncHandler(async (req: Request) => {
	const body: UserSignupInput = await validateBody(req, UserSignupSchema);

	const [user] = await db.insert(users).values({
		...body,
		password: await hashPassword(body.password),
	}).returning();

	return NextResponse.json(
		new APIResponse(true, "User created successfully", user)
	);
});
