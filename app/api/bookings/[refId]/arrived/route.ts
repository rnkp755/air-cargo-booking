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
import { AuthenticatedRequest, requireAdmin } from "@/app/api/users/middleware";

interface RouteParams {
	params: Promise<{ refId: string }>;
}

export const PATCH = requireAdmin(asyncHandler(
	async (req: Request, { params }: RouteParams) => {
		const { refId }: BookingUpdateParams = BookingUpdateParamsSchema.parse(
			await params
		);

		try {
			const result = await withBookingLock(
				refId,
				async (lockedBooking) => {
					// Perform the updation within a database transaction
					const updateResult = await db.transaction(async (tx) => {
						// Check if the current status is DEPARTED
						if (lockedBooking.status !== "DEPARTED") {
							throw APIError.badRequest(
								`Cannot mark as arrived: Booking must be in DEPARTED status, but current status is ${lockedBooking.status}`
							);
						}

						// Update booking status to ARRIVED
						const [updatedBooking] = await tx
							.update(bookings)
							.set({
								status: "ARRIVED",
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
							eventType: "ARRIVED",
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
	}
));
