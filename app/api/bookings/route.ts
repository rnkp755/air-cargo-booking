import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	requireAuthenticated,
	isAdmin,
	AuthenticatedRequest,
} from "@/app/api/users/middleware";
import { eq, desc } from "drizzle-orm";

export const GET = requireAuthenticated(
	asyncHandler(async (req: AuthenticatedRequest) => {
		const url = new URL(req.url);
		const limit = Math.min(
			parseInt(url.searchParams.get("limit") || "50"),
			100
		);

		if (!req.user) {
			return NextResponse.json(APIResponse.error("User not found"), {
				status: 401,
			});
		}

		let myBookings;

		if (isAdmin(req)) {
			myBookings = await db
				.select()
				.from(bookings)
				.limit(limit)
				.orderBy(desc(bookings.createdAt));
		} else {
			myBookings = await db
				.select()
				.from(bookings)
				.where(eq(bookings.createdBy, req.user.id))
				.limit(limit)
				.orderBy(desc(bookings.createdAt));
		}

		return NextResponse.json(
			APIResponse.success("Bookings fetched successfully", {
				bookings: myBookings,
				pagination: {
					limit,
					hasMore: myBookings.length === limit,
				},
			})
		);
	})
);
