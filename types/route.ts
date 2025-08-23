import { z } from "zod";
import { parseISO, isValid } from "date-fns";

export const fetchRoutesSchema = z.object({
	origin: z
		.string()
		.length(3, "Origin must be a 3-character IATA code")
		.toUpperCase(),
	destination: z
		.string()
		.length(3, "Destination must be a 3-character IATA code")
		.toUpperCase(),
	departure_date: z
		.string()
		.refine((date) => {
			const parsedDate = parseISO(date);
			return isValid(parsedDate);
		}, "departure_date must be a valid ISO date (YYYY-MM-DD)")
		.transform((date) => parseISO(date)),
});

export type FetchRoutesRequest = z.infer<typeof fetchRoutesSchema>;

// Response types
export interface DirectFlight {
	id: string;
	flightNumber: string;
	airlineName: string;
	origin: string;
	destination: string;
	departureAt: string;
	arrivalAt: string;
	operateDate: string;
	status: string;
}

export interface TransitRoute {
	firstFlight: DirectFlight;
	secondFlight: DirectFlight;
	transitAirport: string;
	totalDuration: string; // e.g., "5h 30m"
	layoverDuration: string;
}

export interface FetchRoutesResponse {
	directFlights: DirectFlight[];
	transitRoute: TransitRoute | null;
}