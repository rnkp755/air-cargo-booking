import { NextResponse } from "next/server";
import { db } from "@/db";
import { airports } from "@/db/schema/airports";
import { ilike, or } from "drizzle-orm";
import { asyncHandler } from "@/lib/asyncHandler";
import { APIResponse } from "@/lib/apiResponse";

export const GET = asyncHandler(async (req: Request) => {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q");

	if (!query || query.trim().length < 2) {
		return NextResponse.json([], { status: 200 });
	}

	const searchTerm = `%${query.trim()}%`;

	// Search airports by both code and name (case-insensitive)
	const results = await db
		.select({
			code: airports.code,
			name: airports.name,
			timezone: airports.timezone,
		})
		.from(airports)
		.where(
			or(
				ilike(airports.code, searchTerm),
				ilike(airports.name, searchTerm)
			)
		)
		.limit(10)
		.orderBy(airports.code);

	// Transform results to match the expected format
	const formattedResults = results.map((airport) => ({
		code: airport.code,
		name: airport.name,
		timezone: airport.timezone,
	}));

	return NextResponse.json(new APIResponse(true, "Airports fetched successfully", formattedResults));
});
