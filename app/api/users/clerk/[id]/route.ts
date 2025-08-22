import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";

interface Params {
	params: { id: string };
}

export const GET = asyncHandler(async (_req: Request, { params }: Params) => {
	const { id } = params;

	const user = await db
		.select()
		.from(users)
		.where(eq(users.clerkUserId, id))
		.limit(1);

	if (user.length === 0) {
		throw new APIError("User not found", 404);
	}

	return NextResponse.json(
		new APIResponse(true, "User fetched successfully", user[0])
	);
});
