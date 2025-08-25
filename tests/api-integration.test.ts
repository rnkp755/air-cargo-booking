import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { format, addDays } from "date-fns";

// Types based on your API responses
interface APIResponse<T> {
	success: boolean;
	message: string;
	data: T;
	timestamp: string;
}

interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
		createdAt: string;
	};
}

interface UserResponse {
	id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
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

// Authentication credentials
const ADMIN_CREDENTIALS = {
	email: "admin@raushan.info",
	password: "Gocomet@12",
};

const CUSTOMER_CREDENTIALS = {
	name: "Test Customer",
	email: `test.customer.${Date.now()}@example.com`,
	password: "TestPassword123",
	role: "CUSTOMER",
};

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

// Helper function to make authenticated requests
async function makeAuthenticatedRequest<T>(
	endpoint: string,
	token: string,
	options: RequestInit = {}
): Promise<APIResponse<T>> {
	return makeRequest<T>(endpoint, {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	});
}

// Test data storage
let routesData: RoutesResponse;
let adminToken: string;
let customerToken: string;
let customerUser: UserResponse;
let adminUser: UserResponse;
let customerBooking: BookingResponse;

describe("Air Cargo API Integration Tests", () => {
	beforeAll(async () => {
		console.log("🚀 Starting Air Cargo API Integration Tests");
		console.log(`📍 Testing route: ${TEST_ORIGIN} → ${TEST_DESTINATION}`);
	});

	afterAll(() => {
		console.log("🎯 All tests completed!");
	});

	describe("🔐 Authentication & User Management", () => {
		test("should register a new customer", async () => {
			const response = await makeRequest<UserResponse>(
				"/api/users/signup",
				{
					method: "POST",
					body: JSON.stringify(CUSTOMER_CREDENTIALS),
				}
			);

			customerUser = response.data;

			expect(response.success).toBe(true);
			expect(response.data.email).toBe(CUSTOMER_CREDENTIALS.email);
			expect(response.data.role).toBe("CUSTOMER");
			expect(response.data.id).toBeDefined();

			console.log(`✅ Customer registered: ${customerUser.email}`);
		});

		test("should login customer and receive tokens", async () => {
			const response = await makeRequest<AuthResponse>(
				"/api/users/login",
				{
					method: "POST",
					body: JSON.stringify({
						email: CUSTOMER_CREDENTIALS.email,
						password: CUSTOMER_CREDENTIALS.password,
					}),
				}
			);

			customerToken = response.data.accessToken;

			expect(response.success).toBe(true);
			expect(response.data.accessToken).toBeDefined();
			expect(response.data.refreshToken).toBeDefined();
			expect(response.data.user.email).toBe(CUSTOMER_CREDENTIALS.email);
			expect(response.data.user.role).toBe("CUSTOMER");

			console.log("✅ Customer logged in successfully");
		});

		test("should login admin with existing credentials", async () => {
			const response = await makeRequest<AuthResponse>(
				"/api/users/login",
				{
					method: "POST",
					body: JSON.stringify(ADMIN_CREDENTIALS),
				}
			);

			adminToken = response.data.accessToken;
			adminUser = response.data.user;

			expect(response.success).toBe(true);
			expect(response.data.accessToken).toBeDefined();
			expect(response.data.user.role).toBe("ADMIN");

			console.log("✅ Admin logged in successfully");
		});

		test("should get current user info with valid token", async () => {
			const response = await makeAuthenticatedRequest<UserResponse>(
				"/api/auth/me",
				customerToken,
				{ method: "GET" }
			);

			expect(response.success).toBe(true);
			expect(response.data.email).toBe(CUSTOMER_CREDENTIALS.email);
			expect(response.data.role).toBe("CUSTOMER");
		});

		test("should reject invalid credentials", async () => {
			await expect(
				makeRequest("/api/users/login", {
					method: "POST",
					body: JSON.stringify({
						email: "invalid@example.com",
						password: "wrongpassword",
					}),
				})
			).rejects.toThrow();
		});

		test("should reject requests without authentication token", async () => {
			await expect(
				makeRequest("/api/auth/me", { method: "GET" })
			).rejects.toThrow();
		});
	});

	describe("🔍 Public Routes - No Authentication Required", () => {
		test("should fetch available routes without authentication", async () => {
			const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

			const response = await makeRequest<RoutesResponse>("/api/routes", {
				method: "POST",
				body: JSON.stringify({
					origin: TEST_ORIGIN,
					destination: TEST_DESTINATION,
					departure_date: tomorrow,
				}),
			});

			routesData = response.data;

			expect(response.success).toBe(true);
			expect(response.data.directFlights).toBeDefined();
			expect(Array.isArray(response.data.directFlights)).toBe(true);

			console.log(
				`✅ Found ${routesData.directFlights.length} direct flights`
			);
			console.log(
				`✅ Transit route available: ${!!routesData.transitRoute}`
			);
		});

		test("should search airports without authentication", async () => {
			const response = await makeRequest<any>("/api/airports/search", {
				method: "GET",
			});

			expect(response.success).toBe(true);
			expect(response.data).toBeDefined();

			console.log("✅ Airport search accessible without auth");
		});
	});

	describe("👤 Customer-Only Routes", () => {
		test("customer should create booking successfully", async () => {
			if (routesData.directFlights.length === 0) {
				console.log(
					"⏭️ Skipping customer booking - no flights available"
				);
				return;
			}

			const randomFlight =
				routesData.directFlights[
					Math.floor(Math.random() * routesData.directFlights.length)
				];

			const response = await makeAuthenticatedRequest<BookingResponse>(
				"/api/bookings/create",
				customerToken,
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

			customerBooking = response.data;

			expect(response.success).toBe(true);
			expect(response.data.refId).toBeDefined();
			expect(response.data.status).toBe("BOOKED");
			expect(response.data.origin).toBe(TEST_ORIGIN);
			expect(response.data.destination).toBe(TEST_DESTINATION);

			console.log(
				`✅ Customer created booking: ${customerBooking.refId}`
			);
		});

		test("should reject booking creation without authentication", async () => {
			if (routesData.directFlights.length === 0) {
				console.log(
					"⏭️ Skipping unauthenticated booking test - no flights available"
				);
				return;
			}

			const randomFlight = routesData.directFlights[0];

			await expect(
				makeRequest("/api/bookings/create", {
					method: "POST",
					body: JSON.stringify({
						origin: TEST_ORIGIN,
						destination: TEST_DESTINATION,
						flightInstanceIds: [randomFlight.id],
						pieces: 30,
						weightKg: 140,
					}),
				})
			).rejects.toThrow();

			console.log("✅ Booking creation properly protected");
		});

		test("admin should NOT be able to create bookings", async () => {
			if (routesData.directFlights.length === 0) {
				console.log(
					"⏭️ Skipping admin booking rejection test - no flights available"
				);
				return;
			}

			const randomFlight =
				routesData.directFlights[
					Math.floor(Math.random() * routesData.directFlights.length)
				];

			await expect(
				makeAuthenticatedRequest("/api/bookings/create", adminToken, {
					method: "POST",
					body: JSON.stringify({
						origin: TEST_ORIGIN,
						destination: TEST_DESTINATION,
						flightInstanceIds: [randomFlight.id],
						pieces: 25,
						weightKg: 120,
					}),
				})
			).rejects.toThrow();

			console.log("✅ Admin properly denied access to booking creation");
		});
	});

	describe("👮 Admin-Only Routes", () => {
		test("admin should mark booking as departed", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping departed test - no customer booking available"
				);
				return;
			}

			const response =
				await makeAuthenticatedRequest<BookingUpdateResponse>(
					`/api/bookings/${customerBooking.refId}/departed`,
					adminToken,
					{ method: "PATCH" }
				);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("DEPARTED");
			expect(response.data.refId).toBe(customerBooking.refId);

			console.log(`✅ Admin marked ${customerBooking.refId} as DEPARTED`);
		});

		test("customer should NOT be able to mark booking as departed", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping customer departed test - no customer booking available"
				);
				return;
			}

			await expect(
				makeAuthenticatedRequest(
					`/api/bookings/${customerBooking.refId}/departed`,
					customerToken,
					{ method: "PATCH" }
				)
			).rejects.toThrow();

			console.log(
				"✅ Customer properly denied access to departed endpoint"
			);
		});

		test("admin should mark booking as arrived", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping arrived test - no customer booking available"
				);
				return;
			}

			const response =
				await makeAuthenticatedRequest<BookingUpdateResponse>(
					`/api/bookings/${customerBooking.refId}/arrived`,
					adminToken,
					{ method: "PATCH" }
				);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("ARRIVED");

			console.log(`✅ Admin marked ${customerBooking.refId} as ARRIVED`);
		});

		test("customer should NOT be able to mark booking as arrived", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping customer arrived test - no customer booking available"
				);
				return;
			}

			await expect(
				makeAuthenticatedRequest(
					`/api/bookings/${customerBooking.refId}/arrived`,
					customerToken,
					{ method: "PATCH" }
				)
			).rejects.toThrow();

			console.log(
				"✅ Customer properly denied access to arrived endpoint"
			);
		});

		test("admin should mark booking as delivered", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping delivered test - no customer booking available"
				);
				return;
			}

			const response =
				await makeAuthenticatedRequest<BookingUpdateResponse>(
					`/api/bookings/${customerBooking.refId}/delivered`,
					adminToken,
					{ method: "PATCH" }
				);

			expect(response.success).toBe(true);
			expect(response.data.status).toBe("DELIVERED");

			console.log(
				`✅ Admin marked ${customerBooking.refId} as DELIVERED`
			);
		});

		test("unauthenticated users should NOT access admin endpoints", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping unauth admin test - no customer booking available"
				);
				return;
			}

			await expect(
				makeRequest(`/api/bookings/${customerBooking.refId}/departed`, {
					method: "PATCH",
				})
			).rejects.toThrow();

			await expect(
				makeRequest(`/api/bookings/${customerBooking.refId}/arrived`, {
					method: "PATCH",
				})
			).rejects.toThrow();

			console.log(
				"✅ Admin endpoints properly protected from unauthenticated access"
			);
		});
	});

	describe("🔐 Mixed Access Routes", () => {
		test("customer should access their own booking history", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping customer history test - no customer booking available"
				);
				return;
			}

			const response =
				await makeAuthenticatedRequest<BookingHistoryResponse>(
					`/api/bookings/${customerBooking.refId}/history`,
					customerToken,
					{ method: "GET" }
				);

			expect(response.success).toBe(true);
			expect(response.data.booking.refId).toBe(customerBooking.refId);
			expect(response.data.timeline.length).toBeGreaterThanOrEqual(3); // BOOKED, DEPARTED, ARRIVED

			console.log(`✅ Customer accessed their booking history`);
		});

		test("admin should access any booking history", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping admin history test - no customer booking available"
				);
				return;
			}

			const response =
				await makeAuthenticatedRequest<BookingHistoryResponse>(
					`/api/bookings/${customerBooking.refId}/history`,
					adminToken,
					{ method: "GET" }
				);

			expect(response.success).toBe(true);
			expect(response.data.booking.refId).toBe(customerBooking.refId);

			console.log(`✅ Admin accessed customer's booking history`);
		});

		test("customer should get their own bookings list", async () => {
			const response = await makeAuthenticatedRequest<{
				bookings: BookingResponse[];
				pagination: { limit: number; hasMore: boolean };
			}>("/api/bookings", customerToken, { method: "GET" });

			expect(response.success).toBe(true);
			expect(Array.isArray(response.data.bookings)).toBe(true);

			if (customerBooking) {
				expect(
					response.data.bookings.some(
						(booking) => booking.refId === customerBooking.refId
					)
				).toBe(true);
			}

			console.log(`✅ Customer retrieved their bookings list`);
		});

		test("admin should get all bookings list", async () => {
			const response = await makeAuthenticatedRequest<{
				bookings: BookingResponse[];
				pagination: { limit: number; hasMore: boolean };
			}>("/api/bookings", adminToken, { method: "GET" });

			expect(response.success).toBe(true);
			expect(Array.isArray(response.data.bookings)).toBe(true);

			console.log(`✅ Admin retrieved all bookings list`);
		});

		test("unauthenticated users should NOT access booking history", async () => {
			if (!customerBooking) {
				console.log(
					"⏭️ Skipping unauth history test - no customer booking available"
				);
				return;
			}

			await expect(
				makeRequest(`/api/bookings/${customerBooking.refId}/history`, {
					method: "GET",
				})
			).rejects.toThrow();

			console.log(
				"✅ Booking history properly protected from unauthenticated access"
			);
		});

		test("unauthenticated users should NOT access bookings list", async () => {
			await expect(
				makeRequest("/api/bookings", { method: "GET" })
			).rejects.toThrow();

			console.log(
				"✅ Bookings list properly protected from unauthenticated access"
			);
		});
	});

	describe("🚪 Logout Functionality", () => {
		test("customer should logout successfully", async () => {
			const response = await makeAuthenticatedRequest<any>(
				"/api/auth/logout",
				customerToken,
				{ method: "POST" }
			);

			expect(response.success).toBe(true);

			console.log("✅ Customer logged out successfully");
		});

		test("admin should logout successfully", async () => {
			const response = await makeAuthenticatedRequest<any>(
				"/api/auth/logout",
				adminToken,
				{ method: "POST" }
			);

			expect(response.success).toBe(true);

			console.log("✅ Admin logged out successfully");
		});
	});

	describe("❌ Error Handling & Edge Cases", () => {
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
					headers: {
						Authorization: `Bearer ${customerToken}`,
					},
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

		test("should handle expired or invalid tokens", async () => {
			await expect(
				makeAuthenticatedRequest("/api/auth/me", "invalid.token.here", {
					method: "GET",
				})
			).rejects.toThrow();
		});

		test("should validate route search input", async () => {
			await expect(
				makeRequest("/api/routes", {
					method: "POST",
					body: JSON.stringify({
						origin: "", // Invalid
						destination: "",
						departure_date: "invalid-date",
					}),
				})
			).rejects.toThrow();
		});
	});
});
