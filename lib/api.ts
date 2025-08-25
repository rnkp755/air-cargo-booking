import axios from "axios";

// API base configuration
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // Include cookies in requests
});

// Public API client for endpoints that don't require authentication
export const publicApi = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: false, // Don't include cookies for public endpoints
});

export interface UserLoginRequest {
	email: string;
	password: string;
}

export interface AirportSearchResult {
	success: boolean;
	message: string;
	data: {
		code: string;
		name: string;
		timezone: string;
	}[];
	timestamp: string;
}

export interface RouteSearchRequest {
	origin: string;
	destination: string;
	departure_date: string;
}

export interface Flight {
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
	firstFlight: Flight;
	secondFlight: Flight;
	transitAirport: string;
	totalDuration: string;
	layoverDuration: string;
}

export interface RouteSearchResponse {
	success: boolean;
	message: string;
	data: {
		directFlights: Flight[];
		transitRoute: TransitRoute | null;
	};
	timestamp: string;
}

export interface CreateBookingRequest {
	origin: string;
	destination: string;
	flightInstanceIds: string[];
	pieces: number;
	weightKg: number;
}

export interface BookingResponse {
	success: boolean;
	message: string;
	data: {
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
	};
	timestamp: string;
}

export interface BookingHistoryResponse {
	success: boolean;
	message: string;
	data: {
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
			location: string;
			description: string;
			createdAt: string;
		}[];
	};
	timestamp: string;
}

export interface getMyBookingsResponse {
	success: boolean;
	message: string;
	data: {
		bookings: {
			id: string;
			refId: string;
			origin: string;
			destination: string;
			pieces: number;
			weightKg: number;
			status: string;
			createdAt: string;
			updatedAt: string;
		}[];
		pagination: {
			limit: number;
			hasMore: boolean;
		};
	};
	timestamp: string;
}

// API functions
export const searchAirports = async (
	query: string
): Promise<AirportSearchResult> => {
	const response = await publicApi.get("/airports/search", {
		params: { q: query },
	});
	return response.data;
};

export const searchRoutes = async (
	data: RouteSearchRequest
): Promise<RouteSearchResponse> => {
	const response = await publicApi.post("/routes", data);
	return response.data;
};

export const createBooking = async (
	data: CreateBookingRequest
): Promise<BookingResponse> => {
	const response = await api.post("/bookings/create", data);
	return response.data;
};

export const getBookingHistory = async (
	refId: string
): Promise<BookingHistoryResponse> => {
	const response = await api.get(`/bookings/${refId}/history`);
	return response.data;
};

export const cancelBooking = async (refId: string, reason: string) => {
	const response = await api.patch(`/bookings/${refId}/cancel`, { reason });
	return response.data;
};

export const departBooking = async (refId: string) => {
	const response = await api.patch(`/bookings/${refId}/departed`);
	return response.data;
};

export const arriveBooking = async (refId: string) => {
	const response = await api.patch(`/bookings/${refId}/arrived`);
	return response.data;
};

export const deliverBooking = async (refId: string) => {
	const response = await api.patch(`/bookings/${refId}/delivered`);
	return response.data;
};

export const getMyBookings = async (
	limit?: number
): Promise<getMyBookingsResponse> => {
	const params = limit ? `?limit=${limit}` : "";
	const response = await api.get(`/bookings/${params}`);
	return response.data;
};

// Auth API functions
export interface AuthMeResponse {
	success: boolean;
	message: string;
	data: {
		id: string;
		name: string;
		email: string;
		role: "ADMIN" | "CUSTOMER";
		createdAt: string;
		imageUrl?: string;
	};
	timestamp: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	data: {
		accessToken: string;
		refreshToken: string;
		user: {
			id: string;
			name: string;
			email: string;
			role: "ADMIN" | "CUSTOMER";
			createdAt: string;
		};
	};
	timestamp: string;
}

export interface SignupResponse {
	success: boolean;
	message: string;
	data: {
		id: string;
		name: string;
		email: string;
		role: "ADMIN" | "CUSTOMER";
		createdAt: string;
	};
	timestamp: string;
}

export interface LogoutResponse {
	success: boolean;
	message: string;
}

export const getCurrentUser = async (): Promise<AuthMeResponse> => {
	const response = await api.get("/auth/me");
	return response.data;
};

export const loginUser = async (data: {
	email: string;
	password: string;
	role?: "ADMIN" | "CUSTOMER";
}): Promise<LoginResponse> => {
	const response = await api.post("/users/login", data);
	return response.data;
};

export const signupUser = async (data: {
	name: string;
	email: string;
	password: string;
	role?: "ADMIN" | "CUSTOMER";
	imageUrl?: string;
}): Promise<SignupResponse> => {
	const response = await api.post("/users/signup", data);
	return response.data;
};

export const logoutUser = async (): Promise<LogoutResponse> => {
	const response = await api.post("/auth/logout");
	return response.data;
};

// Public API functions (no authentication required)
export const getMetrics = async (): Promise<string> => {
	const response = await publicApi.get("/metrics");
	return response.data;
};
