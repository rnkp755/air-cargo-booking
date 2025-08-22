// ./scripts/seedRoutes.ts

import { db } from "../db";
import { airports } from "@/db/schema/airports";
import { routes } from "@/db/schema/routes";
import "dotenv/config";

// Helper function to get a random element from an array
const getRandomElement = <T>(arr: T[]): T => {
	return arr[Math.floor(Math.random() * arr.length)];
};

export async function seedRoutes() {
	console.log("✈️  Defining and seeding routes...");

	// 1. Fetch all airport codes to build routes
	const allAirportCodes = (
		await db.select({ code: airports.code }).from(airports)
	).map((a) => a.code);

	if (allAirportCodes.length < 3) {
		console.error(
			"❌ Not enough airports to generate routes. Need at least 3."
		);
		return;
	}

	// 2. Clear existing routes to ensure a fresh start
	console.log("🗑️  Clearing existing routes...");
	// Already handled in main.ts

	// 3. Generate new routes (direct and one-stop)
	const newRoutes: (typeof routes.$inferInsert)[] = [];
	const directRoutesToGenerate = 200;
	const oneStopRoutesToGenerate = 150;
	const routeSet = new Set<string>(); // To prevent duplicates before insertion

	// Generate Direct Routes
	while (
		newRoutes.filter((r) => !r.transitAirport).length <
		directRoutesToGenerate
	) {
		let origin: string, destination: string;
		do {
			origin = getRandomElement(allAirportCodes);
			destination = getRandomElement(allAirportCodes);
		} while (origin === destination);

		const key = `${origin}-${destination}-null`;
		if (!routeSet.has(key)) {
			routeSet.add(key);
			newRoutes.push({
				origin,
				destination,
				transitAirport: null,
				isActive: Math.random() > 0.1, // ~90% active
			});
		}
	}

	// Generate One-Stop Routes
	while (
		newRoutes.filter((r) => r.transitAirport).length <
		oneStopRoutesToGenerate
	) {
		let origin: string, destination: string, transit: string;
		do {
			origin = getRandomElement(allAirportCodes);
			destination = getRandomElement(allAirportCodes);
			transit = getRandomElement(allAirportCodes);
		} while (
			origin === destination ||
			origin === transit ||
			destination === transit
		);

		const key = `${origin}-${destination}-${transit}`;
		if (!routeSet.has(key)) {
			routeSet.add(key);
			newRoutes.push({
				origin,
				destination,
				transitAirport: transit,
				isActive: Math.random() > 0.1, // ~90% active
			});
		}
	}

	// 4. Insert into the database
	if (newRoutes.length > 0) {
		// Using onConflictDoNothing to handle potential unique constraint violations gracefully
		const result = await db
			.insert(routes)
			.values(newRoutes)
			.onConflictDoNothing()
			.returning();
		console.log(`✅  Seeded ${result.length} new routes.`);
	} else {
		console.log("No new routes to seed.");
	}
}
