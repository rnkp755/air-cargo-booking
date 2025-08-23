import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { format, addDays } from "date-fns";

// Types based on your API responses
interface APIResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

interface DirectFlight {
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

interface TransitRoute {
	firstFlight: DirectFlight;
	secondFlight: DirectFlight;
	transitAirport: string;
	totalDuration: string;
	layoverDuration: string;
}

interface RoutesResponse {
	directFlights: DirectFlight[];
	transitRoute: TransitRoute | null;
}

interface BookingResponse {
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

interface BookingUpdateResponse {
	id: string;
	refId: string;
	status: string;
	updatedAt: string;
}

interface BookingCancelResponse {
	id: string;
	refId: string;
	status: string;
	cancelledAt: string;
	reason: string;
}

interface BookingHistoryResponse {
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
	timeline: {
		id: string;
		eventType: string;
		location: string | null;
		description: string | null;
		createdAt: string;
	}[];
}

// Test configuration
const BASE_URL = "http://localhost:3000";
const TEST_ORIGIN = "DEL";
const TEST_DESTINATION = "DXB";

// Helper function to make API requests
async function makeRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<APIResponse<T>> {
	const url = `${BASE_URL}${endpoint}`;

	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errorText}`);
	}

	return response.json();
}

// Test data storage
let routesData: RoutesResponse;
let directBooking: BookingResponse;
let transitBooking: BookingResponse;
let lifecycleBooking: BookingResponse;

describe("Air Cargo API Integration Tests", () => {
	beforeAll(() => {
		console.log("🚀 Starting API Integration Tests");
		console.log(`📍 Testing route: ${TEST_ORIGIN} → ${TEST_DESTINATION}`);
	});

	afterAll(() => {
		console.log("🎯 All tests completed!");
	});

	describe("Routes API", () => {
		test("should fetch available routes successfully", async () => {
			const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

			const response = await makeRequest<RoutesResponse>("/api/routes", {
				method: "POST",
				body: JSON.stringify({
					origin: TEST_ORIGIN,
					destination: TEST_DESTINATION,
					departure_date: tomorrow,
				}),
			});

			// Store for later tests
			routesData = response.data;

			// Assertions
			expect(response.success).toBe(true);
			expect(response.data).toBeDefined();
			expect(response.data.directFlights).toBeDefined();
			expect(Array.isArray(response.data.directFlights)).toBe(true);
			expect(response.message).toContain("Found");
			expect(response.timestamp).toBeDefined();

			console.log(
				`✅ Found ${routesData.directFlights.length} direct flights`
			);
			console.log(
				`✅ Transit route available: ${!!routesData.transitRoute}`
			);
		});

		test("should validate route response structure", () => {
			expect(routesData).toBeDefined();

			// Check direct flights structure
			if (routesData.directFlights.length > 0) {
				const flight = routesData.directFlights[0];
				expect(flight.id).toBeDefined();
				expect(flight.flightNumber).toBeDefined();
				expect(flight.airlineName).toBeDefined();
				expect(flight.origin).toBe(TEST_ORIGIN);
				expect(flight.destination).toBe(TEST_DESTINATION);
				expect(flight.departureAt).toBeDefined();
				expect(flight.arrivalAt).toBeDefined();
				expect(flight.status).toBe("SCHEDULED");
			}

			// Check transit route structure if available
			if (routesData.transitRoute) {
				expect(routesData.transitRoute.firstFlight).toBeDefined();
				expect(routesData.transitRoute.secondFlight).toBeDefined();
				expect(routesData.transitRoute.transitAirport).toBeDefined();
				expect(routesData.transitRoute.firstFlight.id).toBeDefined();
				expect(routesData.transitRoute.secondFlight.id).toBeDefined();
			}
		});
	});

	describe("Booking Creation", () => {
		test("should create direct flight booking successfully", async () => {
			// Skip if no direct flights available
			if (routesData.directFlights.length === 0) {
				console.log(
					"⏭️ Skipping direct flight booking - no flights available"
				);
				return;
			}

			const randomFlight =
				routesData.directFlights[
					Math.floor(Math.random() * routesData.directFlights.length)
				];

			const response = await makeRequest<BookingResponse>(
				"/api/bookings/create",
				{
					method: "POST",
					body: JSON.stringify({
						origin: TEST_ORIGIN,
						destination: TEST_DESTINATION,
						flightInstanceIds: [randomFlight.id],
						pieces: 30,
						weightKg: 140,
					}),
				}
			);

			// Store for later tests
			directBooking = response.data;

			// Assertions
			expect(response.success).toBe(true);
			expect(response.data.refId).toBeDefined();
			expect(response.data.status).toBe("BOOKED");
			expect(response.data.origin).toBe(TEST_ORIGIN);
			expect(response.data.destination).toBe(TEST_DESTINATION);
			expect(response.data.pieces).toBe(30);
			expect(response.data.weightKg).toBe(140);
			expect(response.data.flights).toHaveLength(1);
			expect(response.data.flights[0].flightInstanceId).toBe(
				randomFlight.id
			);

			console.log(`✅ Created direct booking: ${directBooking.refId}`);
		});

		test("should create transit route booking successfully", async () => {
			// Skip if no transit route available
			if (!routesData.transitRoute) {
				console.log(
					"⏭️ Skipping transit booking - no transit route available"
				);
				return;
			}

			const response = await makeRequest<BookingResponse>(
				"/api/bookings/create",
				{
					method: "POST",
					body: JSON.stringify({
						origin: TEST_ORIGIN,
						destination: TEST_DESTINATION,
						flightInstanceIds: [
							routesData.transitRoute.firstFlight.id,
							routesData.transitRoute.secondFlight.id,
						],
						pieces: 25,
						weightKg: 120,
					}),
				}
			);

			// Store for later tests
			transitBooking = response.data;

			// Assertions
			expect(response.success).toBe(true);
			expect(response.data.refId).toBeDefined();
			expect(response.data.status).toBe("BOOKED");
			expect(response.data.flights).toHaveLength(2);
			expect(response.data.flights[0].hopOrder).toBe(1);
			expect(response.data.flights[1].hopOrder).toBe(2);

			console.log(`✅ Created transit booking: ${transitBooking.refId}`);
		});
	});

	describe("Booking Lifecycle - Complete Flow", () => {
		test("should mark booking as departed", async () => {
			// Skip if no direct booking
			if (!directBooking) {
				console.log(
					"⏭️ Skipping departed test - no direct booking available"
				);
				return;
			}

			const response = await makeRequest<BookingUpdateResponse>(
				`/api/bookings/${directBooking.refId}/departed`,
				{ method: "PATCH" }
			);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("DEPARTED");
			expect(response.data.refId).toBe(directBooking.refId);

			console.log(`✅ Marked ${directBooking.refId} as DEPARTED`);
		});

		test("should mark booking as arrived (only after departed)", async () => {
			// Skip if no direct booking
			if (!directBooking) {
				console.log(
					"⏭️ Skipping arrived test - no direct booking available"
				);
				return;
			}

			const response = await makeRequest<BookingUpdateResponse>(
				`/api/bookings/${directBooking.refId}/arrived`,
				{ method: "PATCH" }
			);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("ARRIVED");
			expect(response.data.refId).toBe(directBooking.refId);

			console.log(`✅ Marked ${directBooking.refId} as ARRIVED`);
		});

		test("should retrieve complete booking history", async () => {
			// Skip if no direct booking
			if (!directBooking) {
				console.log(
					"⏭️ Skipping history test - no direct booking available"
				);
				return;
			}

			const response = await makeRequest<BookingHistoryResponse>(
				`/api/bookings/${directBooking.refId}/history`,
				{ method: "GET" }
			);

			expect(response.success).toBe(true);
			expect(response.data.booking.refId).toBe(directBooking.refId);
			expect(response.data.booking.status).toBe("ARRIVED");
			expect(response.data.flights).toHaveLength(1);
			expect(response.data.timeline.length).toBeGreaterThanOrEqual(3); // BOOKED, DEPARTED, ARRIVED

			// Check that events are in chronological order (most recent first)
			const events = response.data.timeline;
			expect(events[0].eventType).toBe("ARRIVED");
			expect(events.some((e) => e.eventType === "DEPARTED")).toBe(true);
			expect(events.some((e) => e.eventType === "BOOKED")).toBe(true);

			console.log(
				`✅ Retrieved history for ${directBooking.refId} with ${events.length} events`
			);
		});
	});

	describe("Booking Cancellation Flow", () => {
		test("should cancel transit booking successfully", async () => {
			// Skip if no transit booking
			if (!transitBooking) {
				console.log(
					"⏭️ Skipping cancellation test - no transit booking available"
				);
				return;
			}

			const response = await makeRequest<BookingCancelResponse>(
				`/api/bookings/${transitBooking.refId}/cancel`,
				{
					method: "PATCH",
					body: JSON.stringify({
						reason: "Test cancellation via Vitest",
					}),
				}
			);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("CANCELLED");
			expect(response.data.refId).toBe(transitBooking.refId);
			expect(response.data.reason).toBe("Test cancellation via Vitest");
			expect(response.data.cancelledAt).toBeDefined();

			console.log(`✅ Cancelled ${transitBooking.refId}`);
		});

		test("should retrieve cancelled booking history", async () => {
			// Skip if no transit booking
			if (!transitBooking) {
				console.log(
					"⏭️ Skipping cancelled history test - no transit booking available"
				);
				return;
			}

			const response = await makeRequest<BookingHistoryResponse>(
				`/api/bookings/${transitBooking.refId}/history`,
				{ method: "GET" }
			);

			expect(response.success).toBe(true);
			expect(response.data.booking.status).toBe("CANCELLED");
			expect(response.data.flights).toHaveLength(2); // Transit route has 2 flights

			// Should have BOOKED and CANCELLED events
			const events = response.data.timeline;
			expect(events.some((e) => e.eventType === "CANCELLED")).toBe(true);
			expect(events.some((e) => e.eventType === "BOOKED")).toBe(true);

			console.log(
				`✅ Retrieved cancelled booking history with ${events.length} events`
			);
		});
	});

	describe("Additional Booking Lifecycle Test", () => {
		test("should create another booking for complete lifecycle", async () => {
			// Skip if no direct flights available
			if (routesData.directFlights.length === 0) {
				console.log(
					"⏭️ Skipping additional lifecycle test - no flights available"
				);
				return;
			}

			const randomFlight =
				routesData.directFlights[
					Math.floor(Math.random() * routesData.directFlights.length)
				];

			const response = await makeRequest<BookingResponse>(
				"/api/bookings/create",
				{
					method: "POST",
					body: JSON.stringify({
						origin: TEST_ORIGIN,
						destination: TEST_DESTINATION,
						flightInstanceIds: [randomFlight.id],
						pieces: 15,
						weightKg: 80,
					}),
				}
			);

			lifecycleBooking = response.data;

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("BOOKED");

			console.log(
				`✅ Created lifecycle test booking: ${lifecycleBooking.refId}`
			);
		});

		test("should complete full booking lifecycle (BOOKED → DEPARTED → ARRIVED)", async () => {
			if (!lifecycleBooking) {
				console.log(
					"⏭️ Skipping full lifecycle - no lifecycle booking available"
				);
				return;
			}

			// Step 1: Mark as departed
			const departedResponse = await makeRequest<BookingUpdateResponse>(
				`/api/bookings/${lifecycleBooking.refId}/departed`,
				{ method: "PATCH" }
			);
			expect(departedResponse.data.status).toBe("DEPARTED");

			// Step 2: Mark as arrived
			const arrivedResponse = await makeRequest<BookingUpdateResponse>(
				`/api/bookings/${lifecycleBooking.refId}/arrived`,
				{ method: "PATCH" }
			);
			expect(arrivedResponse.data.status).toBe("ARRIVED");

			// Step 3: Verify history
			const historyResponse = await makeRequest<BookingHistoryResponse>(
				`/api/bookings/${lifecycleBooking.refId}/history`,
				{ method: "GET" }
			);

			expect(historyResponse.data.booking.status).toBe("ARRIVED");
			expect(historyResponse.data.timeline.length).toBeGreaterThanOrEqual(
				3
			);

			console.log(
				`✅ Completed full lifecycle for ${lifecycleBooking.refId}`
			);
		});
	});

	describe("Error Handling", () => {
		test("should handle invalid booking reference", async () => {
			await expect(
				makeRequest("/api/bookings/INVALID_REF/history", {
					method: "GET",
				})
			).rejects.toThrow();
		});

		test("should validate booking input", async () => {
			await expect(
				makeRequest("/api/bookings/create", {
					method: "POST",
					body: JSON.stringify({
						origin: "INVALID",
						destination: TEST_DESTINATION,
						flightInstanceIds: ["invalid-id"],
						pieces: 0, // Invalid
						weightKg: 0, // Invalid
					}),
				})
			).rejects.toThrow();
		});
	});
});
