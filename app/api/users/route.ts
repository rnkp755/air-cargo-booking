import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import { UserSchema, UserInput } from "@/types/user";

export const POST = asyncHandler(async (req: Request) => {
	const body: UserInput = await validateBody(req, UserSchema);

	const [user] = await db.insert(users).values(body).returning();

	return NextResponse.json(
		new APIResponse(true, "User created successfully", user)
	);
});
