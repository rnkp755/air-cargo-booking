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

interface RouteParams {
	params: Promise<{ refId: string }>;
}

export const PATCH = asyncHandler(
	async (req: Request, { params }: RouteParams) => {
		// Validate URL parameter
		const { refId }: BookingUpdateParams = BookingUpdateParamsSchema.parse(
			await params
		);

		try {
			// Use distributed locking to prevent concurrent modifications
			const result = await withBookingLock(
				refId,
				async (lockedBooking) => {
					// Perform the updation within a database transaction
					const updateResult = await db.transaction(async (tx) => {
						// Update booking status to DELIVERED
						// Check if the current status is ARRIVED
						if (lockedBooking.status !== "ARRIVED") {
							throw APIError.badRequest(
								`Cannot mark as DELIVERED: Booking must be in ARRIVED status, but current status is ${lockedBooking.status}`
							);
						}

						// Update booking status to DELIVERED
						const [updatedBooking] = await tx
							.update(bookings)
							.set({
								status: "DELIVERED",
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
							`Booking with ref ${updatedBooking.refId} marked as ARRIVED`
						);

						// Create updation event
						await tx.insert(events).values({
							entityType: "BOOKING",
							entityId: updatedBooking.id,
							eventType: "DELIVERED",
							location: updatedBooking.destination,
							description: `Booking with ref ${updatedBooking.refId} has arrived at ${updatedBooking.destination}`,
						});

						console.log(
							`Event created for booking ref ${updatedBooking.refId} arrival at ${updatedBooking.destination}`
						);

						return {
							booking: updatedBooking,
							updatedAt: new Date().toISOString(),
						};
					});

					return updateResult;
				}
			);

			// Prepare response data
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

			// Re-throw known errors
			if (error instanceof APIError) {
				throw error;
			}

			// Handle unexpected errors
			throw APIError.internal(
				"Failed to update booking status due to an unexpected error"
			);
		}
	}
);
