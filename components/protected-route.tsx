"use client";

import React from "react";
import { useAuth } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: "ADMIN" | "CUSTOMER" | null; // null means any authenticated user
	fallbackMessage?: string;
}

export function ProtectedRoute({
	children,
	requiredRole = null,
	fallbackMessage = "This page requires authentication.",
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	// Show loading while checking auth
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Verifying access...</p>
				</div>
			</div>
		);
	}

	// Check if user is authenticated
	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<Lock className="h-6 w-6 text-primary" />
						</div>
						<CardTitle>Authentication Required</CardTitle>
						<CardDescription>{fallbackMessage}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							onClick={() => router.push("/auth")}
							className="w-full"
						>
							Sign In
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push("/")}
							className="w-full"
						>
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Check role requirements
	if (requiredRole && user.role !== requiredRole) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
							<Lock className="h-6 w-6 text-destructive" />
						</div>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>
							You don't have permission to access this page. This
							page requires {requiredRole.toLowerCase()}{" "}
							privileges.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							variant="outline"
							onClick={() => router.push("/")}
							className="w-full"
						>
							Go Home
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <>{children}</>;
}
