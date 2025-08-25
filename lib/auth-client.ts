"use client";

import React from "react";
import { UserLoginInput, UserSignupInput } from "@/types/user";
import { getCurrentUser, loginUser, signupUser, logoutUser } from "@/lib/api";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "CUSTOMER";
	createdAt: string;
	imageUrl?: string;
}

export interface AuthState {
	user: AuthUser | null;
	isLoading: boolean;
}

// Client-side auth utilities
export class AuthClient {
	private static instance: AuthClient;
	private authState: AuthState = { user: null, isLoading: true };
	private listeners: ((state: AuthState) => void)[] = [];

	private constructor() {
		// Initialize auth state from localStorage/cookies if available
		this.initializeAuth();
	}

	static getInstance(): AuthClient {
		if (!AuthClient.instance) {
			AuthClient.instance = new AuthClient();
		}
		return AuthClient.instance;
	}

	private async initializeAuth() {
		try {
			// Try to get user from stored token using axios
			const response = await getCurrentUser();

			if (response.success) {
				this.setAuthState({ user: response.data, isLoading: false });
				return;
			}
		} catch (error: any) {
			// Only log errors if they're not authentication failures (401)
			// This prevents flooding console with expected auth failures on public pages
			if (error?.response?.status !== 401) {
				console.error("Auth initialization error:", error);
			}
		}

		this.setAuthState({ user: null, isLoading: false });
	}

	private setAuthState(newState: Partial<AuthState>) {
		this.authState = { ...this.authState, ...newState };
		this.listeners.forEach((listener) => listener(this.authState));
	}

	subscribe(listener: (state: AuthState) => void) {
		this.listeners.push(listener);
		// Immediately call with current state
		listener(this.authState);

		// Return unsubscribe function
		return () => {
			const index = this.listeners.indexOf(listener);
			if (index > -1) {
				this.listeners.splice(index, 1);
			}
		};
	}

	getAuthState(): AuthState {
		return this.authState;
	}

	async login(
		data: UserLoginInput
	): Promise<{ success: boolean; message: string }> {
		try {
			this.setAuthState({ isLoading: true });

			const response = await loginUser(data);

			if (response.success) {
				this.setAuthState({
					user: response.data.user,
					isLoading: false,
				});
				return { success: true, message: response.message };
			} else {
				this.setAuthState({ isLoading: false });
				return { success: false, message: response.message };
			}
		} catch (error: any) {
			this.setAuthState({ isLoading: false });
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Login failed";
			return {
				success: false,
				message: errorMessage,
			};
		}
	}

	async signup(
		data: UserSignupInput
	): Promise<{ success: boolean; message: string }> {
		try {
			this.setAuthState({ isLoading: true });

			const response = await signupUser(data);

			if (response.success) {
				this.setAuthState({ isLoading: false });
				return { success: true, message: response.message };
			} else {
				this.setAuthState({ isLoading: false });
				return { success: false, message: response.message };
			}
		} catch (error: any) {
			this.setAuthState({ isLoading: false });
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Signup failed";
			return {
				success: false,
				message: errorMessage,
			};
		}
	}

	async logout(): Promise<void> {
		try {
			await logoutUser();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			this.setAuthState({ user: null, isLoading: false });
		}
	}

	isAuthenticated(): boolean {
		return !!this.authState.user;
	}

	getUser(): AuthUser | null {
		return this.authState.user;
	}
}

// Hook for using auth in React components
export function useAuth() {
	const [authState, setAuthState] = React.useState<AuthState>(() =>
		AuthClient.getInstance().getAuthState()
	);

	React.useEffect(() => {
		const unsubscribe = AuthClient.getInstance().subscribe(setAuthState);
		return unsubscribe;
	}, []);

	const authClient = AuthClient.getInstance();

	return {
		...authState,
		login: authClient.login.bind(authClient),
		signup: authClient.signup.bind(authClient),
		logout: authClient.logout.bind(authClient),
		isAuthenticated: authClient.isAuthenticated.bind(authClient),
	};
}
