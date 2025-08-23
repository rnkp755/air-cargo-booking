// ./scripts/main.ts

import { db } from "../db";
import { flightInstances } from "@/db/schema/flightInstances";
import { flightSchedules } from "@/db/schema/flightSchedules";
import { routes } from "@/db/schema/routes";
import { seedAirports } from "./seedAirports";
import { seedRoutes } from "./seedRoutes";
import { seedFlightSchedules } from "./seedSchedules";
import { seedFlightInstances } from "./seedInstances";
import "dotenv/config";

async function clearExistingData() {
	console.log("🧹 Clearing existing data...");

	// Clear in reverse dependency order
	await db.delete(flightInstances);
	console.log("   ✅ Cleared flight instances");

	await db.delete(flightSchedules);
	console.log("   ✅ Cleared flight schedules");

	await db.delete(routes);
	console.log("   ✅ Cleared routes");
}

async function validateSeeding() {
	console.log("🔍 Validating seeded data...");

	try {
		// Count routes
		const routesResult = await db.select().from(routes);
		const directRoutesCount = routesResult.filter(
			(r) => !r.transitAirport
		).length;
		const transitRoutesCount = routesResult.filter(
			(r) => r.transitAirport
		).length;

		// Count schedules
		const schedulesResult = await db.select().from(flightSchedules);

		// Count instances
		const instancesResult = await db.select().from(flightInstances);

		console.log("📊 Seeding Summary:");
		console.log(`   🛤️  Total routes: ${routesResult.length}`);
		console.log(`   └── Direct routes: ${directRoutesCount}`);
		console.log(`   └── Transit routes: ${transitRoutesCount}`);
		console.log(`   🗓️  Flight schedules: ${schedulesResult.length}`);
		console.log(`   ✈️  Flight instances: ${instancesResult.length}`);

		// Validate hub connectivity (simplified to avoid stack overflow)
		const majorHubs = ["DEL", "BOM", "BLR", "HYD", "CCU", "MAA"];

		console.log("🔗 Hub Connectivity Check (sample):");
		let hubPairsWithDirect = 0;
		let hubPairsWithTransit = 0;
		let totalChecked = 0;

		// Check only first few hub pairs to avoid stack overflow
		const maxPairsToCheck = 10;

		for (
			let i = 0;
			i < majorHubs.length && totalChecked < maxPairsToCheck;
			i++
		) {
			for (
				let j = i + 1;
				j < majorHubs.length && totalChecked < maxPairsToCheck;
				j++
			) {
				const hub1 = majorHubs[i];
				const hub2 = majorHubs[j];

				// Check direct routes
				const directExists = routesResult.some(
					(r) =>
						((r.origin === hub1 && r.destination === hub2) ||
							(r.origin === hub2 && r.destination === hub1)) &&
						!r.transitAirport
				);

				// Check transit routes
				const transitExists = routesResult.some(
					(r) =>
						((r.origin === hub1 && r.destination === hub2) ||
							(r.origin === hub2 && r.destination === hub1)) &&
						r.transitAirport
				);

				if (directExists) hubPairsWithDirect++;
				if (transitExists) hubPairsWithTransit++;
				totalChecked++;
			}
		}

		console.log(
			`   📍 Hub pairs with direct routes: ${hubPairsWithDirect}/${totalChecked} (sample)`
		);
		console.log(
			`   🔄 Hub pairs with transit routes: ${hubPairsWithTransit}/${totalChecked} (sample)`
		);

		// Check today's instances
		const today = new Date().toISOString().split("T")[0];
		const todaysInstances = instancesResult.filter(
			(i) => i.operateDate === today
		).length;
		console.log(`   📅 Today's flight instances: ${todaysInstances}`);

		return {
			routes: routesResult.length,
			schedules: schedulesResult.length,
			instances: instancesResult.length,
			hubDirectCoverage:
				totalChecked > 0
					? ((hubPairsWithDirect / totalChecked) * 100).toFixed(1)
					: "0",
			hubTransitCoverage:
				totalChecked > 0
					? ((hubPairsWithTransit / totalChecked) * 100).toFixed(1)
					: "0",
		};
	} catch (error) {
		console.error("❌ Error during validation:", error);
		return {
			routes: 0,
			schedules: 0,
			instances: 0,
			hubDirectCoverage: "Error",
			hubTransitCoverage: "Error",
		};
	}
}

async function main() {
	console.log("🚀 Starting comprehensive flight data seeding...");
	console.log(
		"🎯 Focus: Major hub connectivity with guaranteed transit routes\n"
	);

	const startTime = Date.now();

	try {
		// Step 1: Clear existing data
		console.log("Step 1/6: Clearing existing data...");
		await clearExistingData();
		console.log("✅ Data cleared successfully\n");

		// Step 2: Seed airports
		console.log("Step 3/6: Seeding airports...");
		await seedAirports();
		console.log("✅ Airports seeded successfully\n");

		// Step 3: Seed routes (with hub focus)
		console.log("Step 3/6: Seeding routes...");
		await seedRoutes();
		console.log("✅ Routes seeded successfully\n");

		// Step 4: Seed schedules (ensuring transit connectivity)
		console.log("Step 4/6: Seeding schedules...");
		await seedFlightSchedules();
		console.log("✅ Schedules seeded successfully\n");

		// Step 5: Seed instances (next 10 days)
		console.log("Step 5/6: Seeding instances...");
		await seedFlightInstances();
		console.log("✅ Instances seeded successfully\n");

		// Step 6: Validate results
		console.log("Step 6/6: Validating results...");
		const stats = await validateSeeding();

		const endTime = Date.now();
		const duration = ((endTime - startTime) / 1000).toFixed(2);

		console.log(`\n🎉 Seeding completed successfully in ${duration}s!`);
		console.log("📈 Key Achievements:");
		console.log(`   ✅ ${stats.routes} total routes created`);
		console.log(`   ✅ ${stats.schedules} flight schedules created`);
		console.log(
			`   ✅ ${stats.instances} flight instances for next 10 days`
		);
		console.log(
			`   ✅ ${stats.hubDirectCoverage}% sample hub pairs have direct routes`
		);
		console.log(
			`   ✅ ${stats.hubTransitCoverage}% sample hub pairs have transit routes`
		);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		console.error(
			"Stack trace:",
			error instanceof Error ? error.stack : "No stack trace available"
		);
		process.exit(1);
	}
}

// Run the seeding
main()
	.then(() => {
		console.log(
			"🏁 Seeding process completed. Ready to test transit routes!"
		);
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Fatal error during seeding:", error);
		process.exit(1);
	});
