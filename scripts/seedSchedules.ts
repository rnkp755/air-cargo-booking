// ./scripts/seedSchedules.ts

import { db } from "../db";
import { flightSchedules } from "@/db/schema/flightSchedules";
import { routes } from "@/db/schema/routes";
import { majorDomesticHubs, majorInternationalHubs } from "./seedRoutes";
import { eq } from "drizzle-orm";
import "dotenv/config";

// Major hubs (same as in routes seeding)
const majorHubs = [
	...majorDomesticHubs,
	...majorInternationalHubs,
];

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
	{ name: "IndiGo", code: "6E" },
	{ name: "Air India", code: "AI" },
	{ name: "SpiceJet", code: "SG" },
	{ name: "Emirates", code: "EK" },
	{ name: "Singapore Airlines", code: "SQ" },
	{ name: "Lufthansa", code: "LH" },
	{ name: "Qatar Airways", code: "QR" },
	{ name: "British Airways", code: "BA" },
	{ name: "Delta Air Lines", code: "DL" },
	{ name: "American Airlines", code: "AA" },
];

// Helper to check if both airports are major hubs
const areBothMajorHubs = (origin: string, destination: string): boolean => {
	return majorHubs.includes(origin) && majorHubs.includes(destination);
};

// Generate appropriate weekday mask based on route importance
const getWeekdayMask = (origin: string, destination: string): number => {
	if (areBothMajorHubs(origin, destination)) {
		// Hub-to-hub routes run daily or frequently
		const patterns = [
			0b1111111, // Daily (every day)
			0b1111110, // Mon-Sat
			0b1111100, // Mon-Fri
		];
		return patterns[Math.floor(Math.random() * patterns.length)];
	} else {
		// Other routes run less frequently
		const patterns = [
			0b1111100, // Mon-Fri
			0b1010101, // Mon, Wed, Fri, Sun
			0b0101010, // Tue, Thu, Sat
			0b1111000, // Mon-Thu
		];
		return patterns[Math.floor(Math.random() * patterns.length)];
	}
};

export async function seedFlightSchedules() {
	console.log(
		"🗓️  Seeding flight schedules with guaranteed hub connectivity..."
	);

	// 1. Fetch ALL active routes (both direct and transit)
	const allActiveRoutes = await db
		.select({
			origin: routes.origin,
			destination: routes.destination,
			transitAirport: routes.transitAirport,
		})
		.from(routes)
		.where(eq(routes.isActive, true));

	if (allActiveRoutes.length === 0) {
		console.error("❌ No active routes found. Please seed routes first.");
		return;
	}

	// Separate direct and transit routes
	const directRoutes = allActiveRoutes.filter(
		(r) => r.transitAirport === null
	);
	const transitRoutes = allActiveRoutes.filter(
		(r) => r.transitAirport !== null
	);

	console.log(
		`📊 Found ${directRoutes.length} direct routes, ${transitRoutes.length} transit routes`
	);

	const newSchedules: (typeof flightSchedules.$inferInsert)[] = [];

	// 2. GUARANTEED SCHEDULES FOR DIRECT ROUTES
	console.log("✈️  Creating schedules for direct routes...");
	for (const route of directRoutes) {
		let schedulesToCreate: number;

		if (areBothMajorHubs(route.origin, route.destination)) {
			// Hub-to-hub: GUARANTEE at least 2-3 flights per route
			schedulesToCreate = Math.floor(Math.random() * 2) + 2; // 2-3 schedules
		} else {
			// Other routes: 1-2 flights
			schedulesToCreate = Math.floor(Math.random() * 2) + 1; // 1-2 schedules
		}

		for (let i = 0; i < schedulesToCreate; i++) {
			const airline =
				airlines[Math.floor(Math.random() * airlines.length)];
			const weekdaysMask = getWeekdayMask(
				route.origin,
				route.destination
			);

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

	// 3. GUARANTEED SCHEDULES FOR TRANSIT ROUTES
	console.log("🔄 Creating schedules for transit route legs...");

	// Group transit routes by transit airport to ensure connectivity
	const transitByHub = new Map<string, typeof transitRoutes>();
	transitRoutes.forEach((route) => {
		const hub = route.transitAirport!;
		if (!transitByHub.has(hub)) {
			transitByHub.set(hub, []);
		}
		transitByHub.get(hub)!.push(route);
	});

	// For each transit route, ensure both legs have schedules
	for (const route of transitRoutes) {
		const { origin, destination, transitAirport } = route;

		// FIRST LEG: origin -> transit
		const firstLegSchedules = Math.floor(Math.random() * 2) + 1; // 1-2 schedules
		for (let i = 0; i < firstLegSchedules; i++) {
			const airline =
				airlines[Math.floor(Math.random() * airlines.length)];
			const weekdaysMask = getWeekdayMask(origin, transitAirport!);

			newSchedules.push({
				flightNumber: `${airline.code}${
					Math.floor(Math.random() * 900) + 100
				}`,
				airlineName: airline.name,
				origin: origin,
				destination: transitAirport!,
				departureTimeLocal: getRandomTime(),
				arrivalTimeLocal: getRandomTime(),
				weekdaysMask,
			});
		}

		// SECOND LEG: transit -> destination
		const secondLegSchedules = Math.floor(Math.random() * 2) + 1; // 1-2 schedules
		for (let i = 0; i < secondLegSchedules; i++) {
			const airline =
				airlines[Math.floor(Math.random() * airlines.length)];
			const weekdaysMask = getWeekdayMask(transitAirport!, destination);

			newSchedules.push({
				flightNumber: `${airline.code}${
					Math.floor(Math.random() * 900) + 100
				}`,
				airlineName: airline.name,
				origin: transitAirport!,
				destination: destination,
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

	console.log(`✅  Seeded ${newSchedules.length} flight schedules:`);

	// Count schedules by route type
	const hubToHubSchedules = newSchedules.filter((s) =>
		areBothMajorHubs(s.origin, s.destination)
	).length;
	const otherSchedules = newSchedules.length - hubToHubSchedules;

	console.log(`   - Hub-to-hub schedules: ${hubToHubSchedules}`);
	console.log(`   - Other schedules: ${otherSchedules}`);
	console.log(`   - Transit routes covered: ${transitRoutes.length}`);
}
