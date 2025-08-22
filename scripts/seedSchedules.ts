// ./scripts/seedSchedules.ts

import { db } from "../db";
import { flightSchedules } from "@/db/schema/flightSchedules";
import { routes } from "@/db/schema/routes";
import { eq, isNull, and } from "drizzle-orm";
import "dotenv/config";

// Helper function to generate a random time string (HH:MM:SS)
const getRandomTime = (): string => {
	const hour = Math.floor(Math.random() * 24)
		.toString()
		.padStart(2, "0");
	const minute = Math.floor(Math.random() * 60)
		.toString()
		.padStart(2, "0");
	return `${hour}:${minute}:00`;
};

const airlines = [
	{ name: "Delta Air Lines", code: "DL" },
	{ name: "American Airlines", code: "AA" },
	{ name: "United Airlines", code: "UA" },
	{ name: "Lufthansa", code: "LH" },
	{ name: "Emirates", code: "EK" },
	{ name: "British Airways", code: "BA" },
	{ name: "Air France", code: "AF" },
	{ name: "Singapore Airlines", code: "SQ" },
	{ name: "Qatar Airways", code: "QR" },
	{ name: "IndiGo", code: "6E" },
];

export async function seedFlightSchedules() {
	console.log("🗓️  Seeding flight schedules based on active routes...");

	// 1. Fetch active, DIRECT routes to build schedules upon
	const activeDirectRoutes = await db
		.select({
			origin: routes.origin,
			destination: routes.destination,
		})
		.from(routes)
		.where(and(eq(routes.isActive, true), isNull(routes.transitAirport)));

	if (activeDirectRoutes.length === 0) {
		console.error(
			"❌ No active direct routes found. Please seed routes first."
		);
		return;
	}

	// 2. Clear existing schedules to prevent duplicates on re-runs
	console.log("🗑️  Clearing existing flight schedules...");
	// ALready handled in main.ts

	// 3. Generate new schedules based on the fetched routes
	const newSchedules: (typeof flightSchedules.$inferInsert)[] = [];

	for (const route of activeDirectRoutes) {
		// For each valid route, create 1 to 3 random schedules
		const schedulesPerRoute = Math.floor(Math.random() * 3) + 1;
		for (let i = 0; i < schedulesPerRoute; i++) {
			const airline =
				airlines[Math.floor(Math.random() * airlines.length)];
			const weekdaysMask = Math.floor(Math.random() * 127) + 1; // At least one day

			newSchedules.push({
				flightNumber: `${airline.code}${
					Math.floor(Math.random() * 900) + 100
				}`,
				airlineName: airline.name,
				origin: route.origin,
				destination: route.destination,
				departureTimeLocal: getRandomTime(),
				arrivalTimeLocal: getRandomTime(),
				weekdaysMask,
			});
		}
	}

	// 4. Insert into database
	if (newSchedules.length > 0) {
		await db.insert(flightSchedules).values(newSchedules);
	}

	console.log(`✅  Seeded ${newSchedules.length} new flight schedules.`);
}
