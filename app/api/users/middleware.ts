import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { APIResponse } from "@/lib/apiResponse";
import { asyncHandler } from "@/lib/asyncHandler";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export interface AuthenticatedUser {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "CUSTOMER";
	createdAt: string;
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

// Utility function to extract token from request
function extractToken(req: Request): string | null {
	// First, try to get token from Authorization header
	const authHeader = req.headers.get("authorization");
	if (authHeader && authHeader.startsWith("Bearer ")) {
		return authHeader.substring(7);
	}

	// Then try with cookies
	const cookieHeader = req.headers.get("cookie");
	if (cookieHeader) {
		const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
			const [key, value] = cookie.trim().split("=");
			acc[key] = value;
			return acc;
		}, {} as Record<string, string>);

		if (cookies.accessToken) {
			console.log("Access Token found !!")
			return cookies.accessToken;
		}
	}

	return null;
}

// Core authentication function
async function authenticateUser(
	req: Request
): Promise<AuthenticatedUser | null> {
	const token = extractToken(req);

	if (!token) {
		return null;
	}

	try {
		const decoded = jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET!
		) as any;

		// Verify user exists in database
		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				role: users.role,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.id, decoded.id))
			.limit(1);

		if (!user) {
			return null;
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt.toISOString(),
		};
	} catch (error) {
		return null;
	}
}

// Middleware factory for role-based authentication
export function requireAuth(
	allowedRoles: ("ADMIN" | "CUSTOMER")[] = ["ADMIN", "CUSTOMER"]
) {
	return function <T>(
		handler: (
			req: AuthenticatedRequest,
			ctx?: any
		) => Promise<NextResponse<T>>
	) {
		return asyncHandler(async (req: Request, ctx?: any) => {
			const user = await authenticateUser(req);

			if (!user) {
				return NextResponse.json(
					APIResponse.error("Authentication required"),
					{ status: 401 }
				);
			}

			if (!allowedRoles.includes(user.role)) {
				return NextResponse.json(
					APIResponse.error("Insufficient permissions"),
					{ status: 403 }
				);
			}

			// Attach user to request
			(req as AuthenticatedRequest).user = user;
			return handler(req as AuthenticatedRequest, ctx);
		});
	};
}

// Predefined middleware for common use cases
export const requireAdmin = requireAuth(["ADMIN"]);
export const requireCustomer = requireAuth(["CUSTOMER"]);
export const requireAuthenticated = requireAuth(["ADMIN", "CUSTOMER"]);

// Helper function to get user from authenticated request
export function getUser(req: AuthenticatedRequest): AuthenticatedUser | null {
	return req.user || null;
}

// Helper function to check if user has specific role
export function hasRole(
	req: AuthenticatedRequest,
	role: "ADMIN" | "CUSTOMER"
): boolean {
	return req.user?.role === role;
}

// Helper function to check if user is admin
export function isAdmin(req: AuthenticatedRequest): boolean {
	return hasRole(req, "ADMIN");
}

// Helper function to check if user is customer
export function isCustomer(req: AuthenticatedRequest): boolean {
	return hasRole(req, "CUSTOMER");
}
