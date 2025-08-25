import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { events } from "@/db/schema/events";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	BookingUpdateParamsSchema,
	BookingUpdateParams,
	BookingUpdateResponse,
} from "@/types/booking";
import { withBookingLock } from "@/lib/utils/bookingLock";
import { eq } from "drizzle-orm";
import { requireAdmin, AuthenticatedRequest } from "@/app/api/users/middleware";

interface RouteParams {
	params: Promise<{ refId: string }>;
}

export const PATCH = requireAdmin(
	asyncHandler(async (req: AuthenticatedRequest, { params }: RouteParams) => {
		const { refId }: BookingUpdateParams = BookingUpdateParamsSchema.parse(
			await params
		);

		try {
			const result = await withBookingLock(
				refId,
				async (lockedBooking) => {
					// Perform the updation within a database transaction
					const updateResult = await db.transaction(async (tx) => {
						// Check if the current status is BOOKED
						if (lockedBooking.status !== "BOOKED") {
							throw APIError.badRequest(
								`Cannot mark as departed: Booking must be in BOOKED status, but current status is ${lockedBooking.status}`
							);
						}

						// Update booking status to DEPARTED
						const [updatedBooking] = await tx
							.update(bookings)
							.set({
								status: "DEPARTED",
								updatedAt: new Date(),
							})
							.where(eq(bookings.id, lockedBooking.id))
							.returning();

						if (!updatedBooking) {
							throw APIError.internal(
								"Failed to update booking status"
							);
						}

						console.log(
							`Booking with ref ${updatedBooking.refId} marked as DEPARTED`
						);

						await tx.insert(events).values({
							entityType: "BOOKING",
							entityId: updatedBooking.id,
							eventType: "DEPARTED",
							location: updatedBooking.origin,
							description: `Booking with ref ${updatedBooking.refId} has departed from ${updatedBooking.origin}`,
						});

						console.log(
							`Event created for booking ref ${updatedBooking.refId} departure from ${updatedBooking.origin}`
						);

						return {
							booking: updatedBooking,
							updatedAt: new Date().toISOString(),
						};
					});

					return updateResult;
				}
			);

			const response: BookingUpdateResponse = {
				id: result.booking.id,
				refId: result.booking.refId,
				status: result.booking.status,
				updatedAt: result.updatedAt,
			};

			return NextResponse.json(
				new APIResponse(
					true,
					"Booking status updated successfully",
					response
				)
			);
		} catch (error) {
			console.error("Booking status updation failed:", error);

			if (error instanceof APIError) {
				throw error;
			}

			throw APIError.internal(
				"Failed to update booking status due to an unexpected error"
			);
		}
	})
);
