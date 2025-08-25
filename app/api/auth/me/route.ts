import { NextResponse } from "next/server";
import { APIResponse } from "@/lib/apiResponse";
import {
	requireAuthenticated,
	type AuthenticatedRequest,
} from "@/app/api/users/middleware";

export const GET = requireAuthenticated(async (req: AuthenticatedRequest) => {
	const user = req.user!;

	return NextResponse.json(new APIResponse(true, "User authenticated", user));
});
