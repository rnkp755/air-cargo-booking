import { NextResponse } from "next/server";
import { db } from "@/db";
import { flightInstances } from "@/db/schema/flightInstances";
import { routes } from "@/db/schema/routes";
import { and, eq, gte, lte, isNull, isNotNull } from "drizzle-orm";
import { asyncHandler } from "@/lib/asyncHandler";
import { validateBody } from "@/lib/validator";
import { APIResponse, APIError } from "@/lib/apiResponse";
import { format, addDays } from "date-fns";
import { fetchRoutesSchema } from "@/types/route";
import type {
	DirectFlight,
	TransitRoute,
	FetchRoutesResponse,
} from "@/types/route";
import { RouteCacheService } from "@/lib/cache/route";

// Helper function to calculate duration between two timestamps
function calculateDuration(start: Date, end: Date): string {
	const diffMs = end.getTime() - start.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
	return `${diffHours}h ${diffMinutes}m`;
}

// Helper function to format flight instance to DirectFlight
function formatFlightInstance(instance: any): DirectFlight {
	return {
		id: instance.id,
		flightNumber: instance.flightNumber,
		airlineName: instance.airlineName,
		origin: instance.origin,
		destination: instance.destination,
		departureAt: instance.departureAt.toISOString(),
		arrivalAt: instance.arrivalAt.toISOString(),
		operateDate: instance.operateDate,
		status: instance.status,
	};
}

async function getDirectFlights(
	origin: string,
	destination: string,
	departureDate: Date
): Promise<DirectFlight[]> {
	const departureDateStr = format(departureDate, "yyyy-MM-dd");

	const directFlights = await db
		.select()
		.from(flightInstances)
		.where(
			and(
				eq(flightInstances.origin, origin),
				eq(flightInstances.destination, destination),
				eq(flightInstances.operateDate, departureDateStr),
				eq(flightInstances.status, "SCHEDULED")
			)
		)
		.orderBy(flightInstances.departureAt);

	return directFlights.map(formatFlightInstance);
}

async function getTransitRoute(
	origin: string,
	destination: string,
	departureDate: Date
): Promise<TransitRoute | null> {
	const departureDateStr = format(departureDate, "yyyy-MM-dd");
	const nextDayStr = format(addDays(departureDate, 1), "yyyy-MM-dd");

	// 1. First, check if there are any valid one-stop routes in the routes table
	const validTransitRoutes = await db
		.select({
			transitAirport: routes.transitAirport,
		})
		.from(routes)
		.where(
			and(
				eq(routes.origin, origin),
				eq(routes.destination, destination),
				eq(routes.isActive, true),
				isNotNull(routes.transitAirport)
			)
		);

	if (validTransitRoutes.length === 0) {
		return null; // No valid transit routes configured
	}

	// 2. For each valid transit airport, try to find connecting flights
	for (const transitRoute of validTransitRoutes) {
		const transitAirport = transitRoute.transitAirport!;

		// Find first leg: origin -> transit (on departure date)
		const firstLegFlights = await db
			.select()
			.from(flightInstances)
			.where(
				and(
					eq(flightInstances.origin, origin),
					eq(flightInstances.destination, transitAirport),
					eq(flightInstances.operateDate, departureDateStr),
					eq(flightInstances.status, "SCHEDULED")
				)
			)
			.orderBy(flightInstances.departureAt);

		if (firstLegFlights.length === 0) continue;

		// For each first leg flight, try to find connecting second leg
		for (const firstFlight of firstLegFlights) {
			// Find second leg: transit -> destination (same day or next day)
			const secondLegFlights = await db
				.select()
				.from(flightInstances)
				.where(
					and(
						eq(flightInstances.origin, transitAirport),
						eq(flightInstances.destination, destination),
						eq(flightInstances.status, "SCHEDULED"),
						// Second flight should be on same day or next day
						gte(flightInstances.operateDate, departureDateStr),
						lte(flightInstances.operateDate, nextDayStr),
						// Second flight departure should be after first flight arrival
						gte(flightInstances.departureAt, firstFlight.arrivalAt)
					)
				)
				.orderBy(flightInstances.departureAt)
				.limit(1); // Get the earliest suitable connection

			if (secondLegFlights.length > 0) {
				const secondFlight = secondLegFlights[0];

				// Calculate durations
				const totalDuration = calculateDuration(
					firstFlight.departureAt,
					secondFlight.arrivalAt
				);
				const layoverDuration = calculateDuration(
					firstFlight.arrivalAt,
					secondFlight.departureAt
				);

				// Return the first valid transit route found
				return {
					firstFlight: formatFlightInstance(firstFlight),
					secondFlight: formatFlightInstance(secondFlight),
					transitAirport,
					totalDuration,
					layoverDuration,
				};
			}
		}
	}

	return null; // No valid transit route found
}

async function fetchRoutesFromDatabase(
	origin: string,
	destination: string,
	departure_date: Date
): Promise<FetchRoutesResponse> {
	const directFlights = await getDirectFlights(
		origin,
		destination,
		departure_date
	);

	const transitRoute = await getTransitRoute(
		origin,
		destination,
		departure_date
	);

	return {
		directFlights,
		transitRoute,
	};
}

export const POST = asyncHandler(async (req: Request) => {
	const { origin, destination, departure_date } = await validateBody(
		req,
		fetchRoutesSchema
	);

	if (origin === destination) {
		throw APIError.badRequest("Origin and destination cannot be the same");
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	if (departure_date < today) {
		throw APIError.badRequest("Departure date cannot be in the past");
	}

	// Try to get data from cache first
	let routeData = await RouteCacheService.get(
		origin,
		destination,
		departure_date
	);
	let fromCache = true;

	// If cache miss, fetch from database
	if (!routeData) {
		fromCache = false;
		routeData = await fetchRoutesFromDatabase(
			origin,
			destination,
			departure_date
		);

		// Cache the result for future requests
		// Use different TTL based on how close the departure date is
		const daysUntilDeparture = Math.ceil(
			(departure_date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
		);
		let cacheTTL = 3600; // Default 1 hour

		if (daysUntilDeparture <= 1) {
			cacheTTL = 300; // 5 minutes for same day or next day
		} else if (daysUntilDeparture <= 7) {
			cacheTTL = 1800; // 30 minutes for within a week
		} else {
			cacheTTL = 3600; // 1 hour for future dates
		}

		await RouteCacheService.set(
			origin,
			destination,
			departure_date,
			routeData,
			cacheTTL
		);
	}

	const response: FetchRoutesResponse = routeData;

	const message = `${fromCache ? "[CACHED] " : ""}Found ${
		response.directFlights.length
	} direct flights${
		response.transitRoute ? " and 1 transit route" : ""
	} for ${origin} to ${destination} on ${format(
		departure_date,
		"yyyy-MM-dd"
	)}`;

	return NextResponse.json(new APIResponse(true, message, response));
});
