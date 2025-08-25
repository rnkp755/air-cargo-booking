import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { events } from "@/db/schema/events";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import {
	BookingCancelParamsSchema,
	BookingCancelInputSchema,
	BookingCancelParams,
	BookingCancelInput,
	BookingCancelResponse,
} from "@/types/booking";
import {
	withBookingLock,
	validateCancellationEligibility,
} from "@/lib/utils/bookingLock";
import { validateBookingAccess } from "@/lib/utils/booking";
import {
	requireAuthenticated,
	AuthenticatedRequest,
} from "@/app/api/users/middleware";
import { eq } from "drizzle-orm";

interface RouteParams {
	params: Promise<{ refId: string }>;
}

export const PATCH = requireAuthenticated(
	asyncHandler(async (req: AuthenticatedRequest, { params }: RouteParams) => {
		const { refId }: BookingCancelParams = BookingCancelParamsSchema.parse(
			await params
		);

		const body: BookingCancelInput = await validateBody(
			req,
			BookingCancelInputSchema
		);
		const { reason } = body;

		// Validate booking access and authorization
		await validateBookingAccess(refId, req.user!);

		const isAdmin = req.user!.role === "ADMIN";
		const cancellationReason =
			reason ||
			(isAdmin
				? "Booking cancelled by admin"
				: "Booking cancelled by user");

		try {
			// Use distributed locking to prevent concurrent modifications
			const result = await withBookingLock(
				refId,
				async (lockedBooking) => {
					// Validate that the booking can be cancelled
					validateCancellationEligibility(lockedBooking.status);

					const cancelResult = await db.transaction(async (tx) => {
						// Update booking status to CANCELLED
						const [updatedBooking] = await tx
							.update(bookings)
							.set({
								status: "CANCELLED",
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
							`Booking with ref ${updatedBooking.refId} marked as CANCELLED`
						);

						await tx.insert(events).values({
							entityType: "BOOKING",
							entityId: updatedBooking.id,
							eventType: "CANCELLED",
							location: updatedBooking.origin,
							description: cancellationReason,
							createdBy: req.user!.id,
						});

						console.log(
							`Event created for booking ref ${updatedBooking.refId} cancellation`
						);

						return {
							booking: updatedBooking,
							cancelledAt: new Date().toISOString(),
							reason: cancellationReason,
						};
					});

					return cancelResult;
				}
			);

			const response: BookingCancelResponse = {
				id: result.booking.id,
				refId: result.booking.refId,
				status: result.booking.status,
				cancelledAt: result.cancelledAt,
				reason: result.reason,
			};

			return NextResponse.json(
				new APIResponse(
					true,
					"Booking cancelled successfully",
					response
				)
			);
		} catch (error) {
			console.error("Booking cancellation failed:", error);

			if (error instanceof APIError) {
				throw error;
			}

			throw APIError.internal(
				"Failed to cancel booking due to an unexpected error"
			);
		}
	})
);
