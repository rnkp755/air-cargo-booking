import { db } from "../db";
import { airports } from "@/db/schema/airports";
import { routes } from "@/db/schema/routes";
import "dotenv/config";

// Define major hubs (both domestic and international)
export const majorDomesticHubs = [
	"DEL",
	"BOM",
	"BLR",
	"HYD",
	"CCU",
	"MAA",
	"AMD",
	"PNQ",
];
export const majorInternationalHubs = [
	"LHR",
	"DXB",
	"SIN",
	"JFK",
	"LAX",
	"CDG",
	"FRA",
	"NRT",
	"SYD",
	"HKG",
];

const getRandomElement = <T>(arr: T[]): T => {
	return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomElements = <T>(arr: T[], count: number): T[] => {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
};

export async function seedRoutes() {
	console.log(
		"✈️  Seeding hub-focused routes with guaranteed connectivity..."
	);

	const allAirportCodes = (
		await db.select({ code: airports.code }).from(airports)
	).map((a) => a.code);

	if (allAirportCodes.length < 3) {
		console.error(
			"❌ Not enough airports to generate routes. Need at least 3."
		);
		return;
	}

	// Filter available hubs from seeded airports
	const availableDomesticHubs = allAirportCodes.filter((code) =>
		majorDomesticHubs.includes(code)
	);
	const availableIntlHubs = allAirportCodes.filter((code) =>
		majorInternationalHubs.includes(code)
	);
	const allMajorHubs = [...availableDomesticHubs, ...availableIntlHubs];
	const otherAirports = allAirportCodes.filter(
		(code) => !allMajorHubs.includes(code)
	);

	console.log(
		`📍 Found ${availableDomesticHubs.length} domestic hubs, ${availableIntlHubs.length} international hubs`
	);

	const newRoutes: (typeof routes.$inferInsert)[] = [];
	const routeSet = new Set<string>();

	// 1. GUARANTEED HUB-TO-HUB CONNECTIVITY
	console.log(
		"🔗 Creating guaranteed hub-to-hub routes (direct + transit)..."
	);

	for (let i = 0; i < allMajorHubs.length; i++) {
		for (let j = i + 1; j < allMajorHubs.length; j++) {
			const hub1 = allMajorHubs[i];
			const hub2 = allMajorHubs[j];

			// DIRECT routes (bidirectional) - GUARANTEED
			[
				[hub1, hub2],
				[hub2, hub1],
			].forEach(([origin, destination]) => {
				const key = `${origin}-${destination}-null`;
				if (!routeSet.has(key)) {
					routeSet.add(key);
					newRoutes.push({
						origin,
						destination,
						transitAirport: null,
						isActive: true, // 100% active for hub direct routes
					});
				}
			});

			// TRANSIT routes (bidirectional) - GUARANTEED
			// Each hub pair gets at least one transit route via another major hub
			const possibleTransitHubs = allMajorHubs.filter(
				(h) => h !== hub1 && h !== hub2
			);
			if (possibleTransitHubs.length > 0) {
				// Pick 1-2 transit hubs for this pair
				const transitHubs = getRandomElements(
					possibleTransitHubs,
					Math.min(2, possibleTransitHubs.length)
				);

				transitHubs.forEach((transitHub) => {
					[
						[hub1, hub2, transitHub],
						[hub2, hub1, transitHub],
					].forEach(([origin, destination, transit]) => {
						const key = `${origin}-${destination}-${transit}`;
						if (!routeSet.has(key)) {
							routeSet.add(key);
							newRoutes.push({
								origin,
								destination,
								transitAirport: transit,
								isActive: true, // 100% active for hub transit routes
							});
						}
					});
				});
			}
		}
	}

	// 2. HUB-TO-OTHER DIRECT ROUTES (selective)
	console.log("🌟 Creating hub-to-other airport routes...");
	allMajorHubs.forEach((hub) => {
		// Each hub connects to 5-8 other airports (direct only)
		const connections = getRandomElements(
			otherAirports,
			Math.min(8, otherAirports.length)
		);
		connections.forEach((other) => {
			[
				[hub, other],
				[other, hub],
			].forEach(([origin, destination]) => {
				const key = `${origin}-${destination}-null`;
				if (!routeSet.has(key)) {
					routeSet.add(key);
					newRoutes.push({
						origin,
						destination,
						transitAirport: null,
						isActive: Math.random() > 0.1, // 90% active
					});
				}
			});
		});
	});

	// 3. SOME OTHER-TO-OTHER DIRECT ROUTES (limited)
	console.log("🏘️ Creating limited other-to-other routes...");
	const otherRoutesToAdd = Math.min(30, otherAirports.length);
	for (let i = 0; i < otherRoutesToAdd; i++) {
		let origin: string, destination: string;
		let attempts = 0;
		do {
			origin = getRandomElement(otherAirports);
			destination = getRandomElement(otherAirports);
			attempts++;
		} while (
			(origin === destination ||
				routeSet.has(`${origin}-${destination}-null`)) &&
			attempts < 10
		);

		if (attempts < 10) {
			const key = `${origin}-${destination}-null`;
			routeSet.add(key);
			newRoutes.push({
				origin,
				destination,
				transitAirport: null,
				isActive: Math.random() > 0.2, // 80% active
			});
		}
	}

	// 4. Insert into database
	if (newRoutes.length > 0) {
		const result = await db
			.insert(routes)
			.values(newRoutes)
			.onConflictDoNothing()
			.returning();

		const directRoutes = result.filter((r) => !r.transitAirport).length;
		const transitRoutes = result.filter((r) => r.transitAirport).length;

		console.log(`✅  Seeded ${result.length} total routes:`);
		console.log(`   - Direct routes: ${directRoutes}`);
		console.log(`   - Transit routes: ${transitRoutes}`);
		console.log(
			`   - Hub pairs covered: ${
				(allMajorHubs.length * (allMajorHubs.length - 1)) / 2
			}`
		);
	} else {
		console.log("No new routes to seed.");
	}
}
