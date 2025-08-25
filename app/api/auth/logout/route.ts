import { NextResponse } from "next/server";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";

export const POST = asyncHandler(async () => {
	const response = NextResponse.json(
		new APIResponse(true, "Logged out successfully")
	);

	// Clear auth cookies
	response.cookies.set("accessToken", "", {
		httpOnly: true,
		secure: true,
		maxAge: 0,
	});

	response.cookies.set("refreshToken", "", {
		httpOnly: true,
		secure: true,
		maxAge: 0,
	});

	return response;
});
