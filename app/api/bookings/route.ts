import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { users } from "@/db/schema/users";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	requireAuthenticated,
	isAdmin,
	AuthenticatedRequest,
} from "@/app/api/users/middleware";
import { eq, desc, inArray } from "drizzle-orm";

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

			// Collect all unique `createdBy` field from bookings
			const uniqueCreatedByIds = Array.from(
				new Set(
					myBookings
						.map((booking) => booking.createdBy)
						.filter((id): id is string => id !== null)
				)
			);

			// Fetch user details for all unique createdBy IDs in a single query
			const usersMap = new Map<string, string>();
			if (uniqueCreatedByIds.length > 0) {
				const usersData = await db
					.select({
						id: users.id,
						name: users.name,
						email: users.email,
					})
					.from(users)
					.where(inArray(users.id, uniqueCreatedByIds as string[]));

				// Create a map for quick lookup
				usersData.forEach((user) => {
					usersMap.set(user.id, `${user.name} - (${user.email})`);
				});
			}

			// Transform bookings to replace createdBy with user details
			myBookings = myBookings.map((booking) => ({
				...booking,
				createdBy: booking.createdBy
					? usersMap.get(booking.createdBy) || booking.createdBy
					: null,
			}));
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
