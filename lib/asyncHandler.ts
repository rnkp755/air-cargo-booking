import { NextResponse } from "next/server";
import { APIError, APIResponse } from "@/lib/apiResponse";

type Handler<T = any> = (req: Request, ctx?: any) => Promise<NextResponse<T>>;

function handleDatabaseError(err: any): APIError {
	const actualError = err.cause || err;
	const actualErrorDetail = actualError.detail;

	console.log("Error code:", actualError.code);
	console.log("Error detail:", actualError.detail);

	// PostgreSQL error codes - check both err and actualError

	if (actualError.code) {
		switch (actualError.code) {
			case "23505": // unique_violation
				if (actualError.constraint === "users_clerk_user_id_unique") {
					return APIError.conflict(
						`User already exists with this account: ${actualErrorDetail}`
					);
				}
				if (actualError.constraint?.includes("ref_id")) {
					return APIError.conflict(
						`Booking reference ID already exists: ${actualErrorDetail}`
					);
				}
				return APIError.conflict(
					`Record already exists: ${actualErrorDetail}`
				);

			case "23503": // foreign_key_violation
				return APIError.badRequest(
					`Invalid reference to related data: ${actualErrorDetail}`
				);

			case "23502": // not_null_violation
				return APIError.badRequest(
					`Required field '${actualError.column}' is missing: ${actualErrorDetail}`
				);

			case "23514": // check_violation
				return APIError.badRequest(
					`Data violates validation constraints: ${actualErrorDetail}`
				);

			case "42703": // undefined_column
				return APIError.badRequest(
					`Invalid field specified: ${actualErrorDetail}`
				);

			default:
				return APIError.internal(
					`Database operation failed: ${actualErrorDetail}`
				);
		}
	}

	return APIError.internal(`Database Error: ${actualErrorDetail}`);
}

export function asyncHandler(handler: Handler): Handler {
	return async (req, ctx) => {
		try {
			return await handler(req, ctx);
		} catch (err: any) {
			console.error("API Error:", err);

			if (err instanceof APIError) {
				return NextResponse.json(APIResponse.error(err.message), {
					status: err.statusCode,
				});
			}

			// Handle database errors
			const dbError = handleDatabaseError(err);
			return NextResponse.json(APIResponse.error(dbError.message), {
				status: dbError.statusCode,
			});
		}
	};
}
