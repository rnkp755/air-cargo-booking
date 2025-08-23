import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { bookingFlights } from "@/db/schema/bookingFlights";
import { flightInstances } from "@/db/schema/flightInstances";
import { events } from "@/db/schema/events";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import {
	BookingInputSchema,
	BookingInput,
	BookingResponse,
} from "@/types/booking";
import {
	generateBookingRefId,
	validateFlightRoute,
	ensureUniqueRefId,
} from "@/lib/utils/booking";
import { eq } from "drizzle-orm";

export const POST = asyncHandler(async (req: Request) => {
	const body: BookingInput = await validateBody(req, BookingInputSchema);

	const { origin, destination, pieces, weightKg, flightInstanceIds } = body;

	// Validate and get flight instances
	const validatedFlights = await validateFlightRoute(
		flightInstanceIds,
		origin,
		destination
	);

	// Generate unique reference ID
	const baseRefId = generateBookingRefId(origin, destination);
	const refId = await ensureUniqueRefId(baseRefId);

	try {
		// Start transaction
		const result = await db.transaction(async (tx) => {
			// Create booking record
			const [booking] = await tx
				.insert(bookings)
				.values({
					refId,
					origin,
					destination,
					pieces,
					weightKg,
					status: "BOOKED",
				})
				.returning();

			// Create booking-flight associations
			const bookingFlightData = validatedFlights.map((flight, index) => ({
				bookingId: booking.id,
				flightInstanceId: flight.id,
				hopOrder: (index + 1) as 1 | 2,
			}));

			await tx.insert(bookingFlights).values(bookingFlightData);

			// Create booking event
			await tx.insert(events).values({
				entityType: "BOOKING",
				entityId: booking.id,
				eventType: "BOOKED",
				location: origin,
				description: `Booking created with reference ${refId}`,
			});

			return booking;
		});

		// Fetch complete booking data with flights for response
		const completeBooking = await db
			.select({
				// Booking fields
				id: bookings.id,
				refId: bookings.refId,
				origin: bookings.origin,
				destination: bookings.destination,
				pieces: bookings.pieces,
				weightKg: bookings.weightKg,
				status: bookings.status,
				createdAt: bookings.createdAt,
				updatedAt: bookings.updatedAt,
				// Flight fields
				flightInstanceId: flightInstances.id,
				flightNumber: flightInstances.flightNumber,
				airlineName: flightInstances.airlineName,
				flightOrigin: flightInstances.origin,
				flightDestination: flightInstances.destination,
				departureAt: flightInstances.departureAt,
				arrivalAt: flightInstances.arrivalAt,
				hopOrder: bookingFlights.hopOrder,
			})
			.from(bookings)
			.innerJoin(
				bookingFlights,
				eq(bookings.id, bookingFlights.bookingId)
			)
			.innerJoin(
				flightInstances,
				eq(bookingFlights.flightInstanceId, flightInstances.id)
			)
			.where(eq(bookings.id, result.id))
			.orderBy(bookingFlights.hopOrder);

		if (completeBooking.length === 0) {
			throw APIError.internal("Failed to retrieve created booking");
		}

		// Transform data for response
		const bookingData = completeBooking[0];
		const response: BookingResponse = {
			id: bookingData.id,
			refId: bookingData.refId,
			origin: bookingData.origin,
			destination: bookingData.destination,
			pieces: bookingData.pieces,
			weightKg: bookingData.weightKg,
			status: bookingData.status,
			flights: completeBooking.map((row) => ({
				flightInstanceId: row.flightInstanceId,
				flightNumber: row.flightNumber,
				airlineName: row.airlineName,
				origin: row.flightOrigin,
				destination: row.flightDestination,
				departureAt: row.departureAt.toISOString(),
				arrivalAt: row.arrivalAt.toISOString(),
				hopOrder: row.hopOrder,
			})),
			createdAt: bookingData.createdAt.toISOString(),
			updatedAt: bookingData.updatedAt.toISOString(),
		};

		return NextResponse.json(
			new APIResponse(true, "Booking created successfully", response),
			{ status: 201 }
		);
	} catch (error) {
		console.error("Booking creation failed:", error);
		throw error;
	}
});
