import { z } from "zod";

export const BookingInputSchema = z.object({
	origin: z.string().length(3, "Origin must be a 3-letter airport code"),
	destination: z
		.string()
		.length(3, "Destination must be a 3-letter airport code"),
	pieces: z.number().int().min(1, "Pieces must be at least 1"),
	weightKg: z.number().int().min(1, "Weight must be at least 1kg"),
	flightInstanceIds: z
		.array(z.uuid())
		.min(1)
		.max(2, "Maximum 2 flights allowed (direct or transit)"),
});

export type BookingInput = z.infer<typeof BookingInputSchema>;

export interface BookingResponse {
	id: string;
	refId: string;
	origin: string;
	destination: string;
	pieces: number;
	weightKg: number;
	status: string;
	flights: {
		flightInstanceId: string;
		flightNumber: string;
		airlineName: string;
		origin: string;
		destination: string;
		departureAt: string;
		arrivalAt: string;
		hopOrder: number;
	}[];
	createdAt: string;
	updatedAt: string;
}

export const BookingHistoryParamsSchema = z.object({
	refId: z.string().min(1, "Reference ID is required"),
});

export type BookingHistoryParams = z.infer<typeof BookingHistoryParamsSchema>;

export interface BookingEvent {
	id: string;
	eventType: string;
	location: string | null;
	description: string | null;
	createdAt: string;
}

export interface BookingHistoryResponse {
	booking: {
		id: string;
		refId: string;
		origin: string;
		destination: string;
		pieces: number;
		weightKg: number;
		status: string;
		createdAt: string;
		updatedAt: string;
	};
	flights: {
		flightInstanceId: string;
		flightNumber: string;
		airlineName: string;
		origin: string;
		destination: string;
		departureAt: string;
		arrivalAt: string;
		hopOrder: number;
		status: string;
	}[];
	timeline: BookingEvent[];
}

export const BookingCancelParamsSchema = z.object({
	refId: z.string().min(1, "Reference ID is required"),
});

export const BookingCancelInputSchema = z.object({
	reason: z.string().optional().default("Cancelled by user"),
});

export type BookingCancelParams = z.infer<typeof BookingCancelParamsSchema>;
export type BookingCancelInput = z.infer<typeof BookingCancelInputSchema>;

export interface BookingCancelResponse {
	id: string;
	refId: string;
	status: string;
	cancelledAt: string;
	reason: string;
}

export const BookingUpdateParamsSchema = z.object({
	refId: z.string().min(1, "Reference ID is required"),
});

export type BookingUpdateParams = z.infer<typeof BookingUpdateParamsSchema>;

export interface BookingUpdateResponse {
	id: string;
	refId: string;
	status: string;
	updatedAt: string;
}
