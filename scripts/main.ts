// ./scripts/main.ts

import { seedAirports } from "./seedAirports";
import { seedRoutes } from "./seedRoutes";
import { seedFlightSchedules } from "./seedSchedules";
import { seedFlightInstances } from "./seedInstances";
import { db } from "../db";
import { routes } from "@/db/schema/routes";
import { flightInstances } from "@/db/schema/flightInstances";
import { flightSchedules } from "@/db/schema/flightSchedules";
import { sql } from "drizzle-orm";

async function main() {
	console.log("🚀  Starting database seeding process...");

	try {
		// Step 1: Clear dependent data in the correct order to avoid FK violations
		console.log("🗑️  Clearing existing flight data...");
		await db.delete(flightInstances);
		await db.delete(flightSchedules);
		await db.delete(routes);
		console.log("✅  Cleared old data.");

		// Step 2: Seed new data in the correct order
		// The order is important due to foreign key constraints
		await seedAirports();
		await seedRoutes();
		await seedFlightSchedules();
		await seedFlightInstances();

		console.log("🏁  Database seeding completed successfully!");
	} catch (error) {
		console.error(
			"❌  An error occurred during the seeding process:",
			error
		);
		process.exit(1);
	} finally {
		await db.execute(sql`SELECT 1`); // Dummy query to ensure connection is active before exit
		console.log("👋  Exiting seed script.");
		process.exit(0);
	}
}

main();
