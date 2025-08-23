// app/api/bookings/[refId]/history/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { bookingFlights } from "@/db/schema/bookingFlights";
import { flightInstances } from "@/db/schema/flightInstances";
import { events } from "@/db/schema/events";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import {
	BookingHistoryParamsSchema,
	BookingHistoryResponse,
} from "@/types/booking";
import { eq, desc } from "drizzle-orm";

interface RouteParams {
	params: { refId: string };
}

export const GET = asyncHandler(
	async (req: Request, { params }: RouteParams) => {
		// Validate the reference ID parameter
		const { refId } = BookingHistoryParamsSchema.parse(params);

		// Fetch booking with flights
		const bookingWithFlights = await db
			.select({
				// Booking fields
				bookingId: bookings.id,
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
				flightStatus: flightInstances.status,
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
			.where(eq(bookings.refId, refId))
			.orderBy(bookingFlights.hopOrder);

		if (bookingWithFlights.length === 0) {
			throw APIError.notFound(
				`Booking with reference ID '${refId}' not found`
			);
		}

		// Extract booking data (same across all rows)
		const bookingData = bookingWithFlights[0];

		// Fetch complete event timeline for this booking
		const bookingEvents = await db
			.select({
				id: events.id,
				eventType: events.eventType,
				location: events.location,
				description: events.description,
				createdAt: events.createdAt,
			})
			.from(events)
			.where(eq(events.entityId, bookingData.bookingId))
			.orderBy(desc(events.createdAt)); // Most recent events first

		// Also fetch flight events for comprehensive timeline
		const flightInstanceIds = bookingWithFlights.map(
			(row) => row.flightInstanceId
		);

		const flightEvents = await db
			.select({
				id: events.id,
				eventType: events.eventType,
				location: events.location,
				description: events.description,
				createdAt: events.createdAt,
				entityId: events.entityId, // To identify which flight
			})
			.from(events)
			.where(eq(events.entityType, "FLIGHT"))
			.orderBy(desc(events.createdAt));

		// Filter flight events to only include those for flights in this booking
		const relevantFlightEvents = flightEvents.filter((event) =>
			flightInstanceIds.includes(event.entityId)
		);

		// Combine and sort all events chronologically (most recent first)
		const allEvents = [
			...bookingEvents.map((event) => ({
				...event,
				type: "booking" as const,
			})),
			...relevantFlightEvents.map((event) => ({
				...event,
				type: "flight" as const,
			})),
		].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime()
		);

		// Transform data for response
		const response: BookingHistoryResponse = {
			booking: {
				id: bookingData.bookingId,
				refId: bookingData.refId,
				origin: bookingData.origin,
				destination: bookingData.destination,
				pieces: bookingData.pieces,
				weightKg: bookingData.weightKg,
				status: bookingData.status,
				createdAt: bookingData.createdAt.toISOString(),
				updatedAt: bookingData.updatedAt.toISOString(),
			},
			flights: bookingWithFlights.map((row) => ({
				flightInstanceId: row.flightInstanceId,
				flightNumber: row.flightNumber,
				airlineName: row.airlineName,
				origin: row.flightOrigin,
				destination: row.flightDestination,
				departureAt: row.departureAt.toISOString(),
				arrivalAt: row.arrivalAt.toISOString(),
				hopOrder: row.hopOrder,
				status: row.flightStatus,
			})),
			timeline: allEvents.map((event) => ({
				id: event.id,
				eventType: event.eventType,
				location: event.location,
				description:
					event.description ||
					`${
						event.type === "booking" ? "Booking" : "Flight"
					} ${event.eventType.toLowerCase()}`,
				createdAt: event.createdAt.toISOString(),
			})),
		};

		return NextResponse.json(
			new APIResponse(
				true,
				"Booking history retrieved successfully",
				response
			)
		);
	}
);
