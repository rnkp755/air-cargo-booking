"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthClient, useAuth } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface AuthProviderProps {
	children: React.ReactNode;
}

const publicPaths = ["/", "/auth"];

export function AuthProvider({ children }: AuthProviderProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (!isLoading) {
			setIsInitialized(true);
		}
	}, [isLoading]);

	useEffect(() => {
		if (!isInitialized) return;

		// Check if current path requires authentication
		const isPublicPath =
			publicPaths.includes(pathname) || pathname.startsWith("/api");

		// Redirect to auth if not authenticated and trying to access protected route
		if (!user && !isPublicPath) {
			router.push("/auth");
			return;
		}

		// Redirect to home if authenticated and trying to access auth page
		if (user && pathname === "/auth") {
			router.push("/");
			return;
		}
	}, [user, pathname, router, isInitialized]);

	// Show loading spinner while initializing auth
	if (!isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
