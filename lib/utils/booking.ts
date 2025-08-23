// lib/bookingUtils.ts
import { db } from "@/db";
import { flightInstances } from "@/db/schema/flightInstances";
import { bookings } from "@/db/schema/bookings";
import { eq, inArray } from "drizzle-orm";
import { APIError } from "@/lib/apiResponse";

/**
 * Generates a human-friendly booking reference ID
 * Format: ORG_DEST_XXXXXX (e.g., DEL_SYD_A1B2C3)
 */
export function generateBookingRefId(
	origin: string,
	destination: string
): string {
	const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const digits = "0123456789";
	let randomCode = "";

	// First 3 characters must be alphabets
	for (let i = 0; i < 3; i++) {
		randomCode += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
	}

	// Last 3 characters must be digits
	for (let i = 0; i < 3; i++) {
		randomCode += digits.charAt(Math.floor(Math.random() * digits.length));
	}

	return `${origin.toUpperCase()}_${destination.toUpperCase()}_${randomCode}`;
}

/**
 * Validates flight instances and ensures they form a valid route
 */
export async function validateFlightRoute(
	flightInstanceIds: string[],
	origin: string,
	destination: string
) {

	console.log(`Validating flight route for origin ${origin}, destination ${destination}, flights: ${flightInstanceIds.join(", ")}`);

	// Fetch flight instances
	const flights = await db
		.select()
		.from(flightInstances)
		.where(inArray(flightInstances.id, flightInstanceIds));

	if (flights.length !== flightInstanceIds.length) {
		throw APIError.badRequest("One or more flight instances not found");
	}

	// Check if flights are available (not departed/cancelled)
	const unavailableFlights = flights.filter(
		(f) => !["SCHEDULED"].includes(f.status)
	);

	if (unavailableFlights.length > 0) {
		throw APIError.badRequest(
			`Flights are not available for booking: ${unavailableFlights
				.map((f) => f.flightNumber)
				.join(", ")}`
		);
	}

	if (flights.length === 1) {
		// Direct flight validation
		const flight = flights[0];
		if (flight.origin !== origin || flight.destination !== destination) {
			throw APIError.badRequest(
				"Flight route does not match booking origin and destination"
			);
		}
		return flights;
	} else if (flights.length === 2) {
		// Transit flight validation
		const sortedFlights = flights.sort(
			(a, b) =>
				new Date(a.departureAt).getTime() -
				new Date(b.departureAt).getTime()
		);

		const [firstFlight, secondFlight] = sortedFlights;

		// Validate route continuity
		if (firstFlight.origin !== origin) {
			throw APIError.badRequest(
				"First flight must depart from booking origin"
			);
		}

		if (secondFlight.destination !== destination) {
			throw APIError.badRequest(
				"Second flight must arrive at booking destination"
			);
		}

		if (firstFlight.destination !== secondFlight.origin) {
			throw APIError.badRequest(
				"Transit flights must be connected (first arrival = second departure airport)"
			);
		}

		// Check timing - second flight should depart after first flight arrives
		if (
			new Date(secondFlight.departureAt) <=
			new Date(firstFlight.arrivalAt)
		) {
			throw APIError.badRequest(
				"Invalid transit timing - insufficient layover time"
			);
		}

		// Check if flights are on valid dates (within reasonable layover time - max 24 hours)
		const layoverHours =
			(new Date(secondFlight.departureAt).getTime() -
				new Date(firstFlight.arrivalAt).getTime()) /
			(1000 * 60 * 60);
		if (layoverHours > 24) {
			throw APIError.badRequest(
				"Layover time exceeds maximum allowed duration (24 hours)"
			);
		}

		return sortedFlights;
	} else {
		throw APIError.badRequest(
			"Invalid number of flights. Only direct (1) or transit (2) flights allowed"
		);
	}
}

/**
 * Checks if a booking reference ID is unique
 */
export async function ensureUniqueRefId(refId: string): Promise<string> {
	const existing = await db
		.select({ id: bookings.id })
		.from(bookings)
		.where(eq(bookings.refId, refId))
		.limit(1);

	if (existing.length > 0) {
		// Generate a new one if collision (very rare but possible)
		const [origin, destination] = refId.split("_");
		return ensureUniqueRefId(generateBookingRefId(origin, destination));
	}

	return refId;
}
