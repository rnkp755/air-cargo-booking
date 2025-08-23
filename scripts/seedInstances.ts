// ./scripts/seedInstances.ts

import { db } from "../db";
import { airports } from "@/db/schema/airports";
import { flightInstances } from "@/db/schema/flightInstances";
import { flightSchedules } from "@/db/schema/flightSchedules";
import { alias } from "drizzle-orm/pg-core";
import { eq, getTableColumns } from "drizzle-orm";
import { addDays, format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import "dotenv/config";

export async function seedFlightInstances() {
	console.log(
		"🛫  Seeding flight instances for the next 10 days starting from today..."
	);

	// 1. Clear existing instances to prevent duplicates on re-runs
	console.log("🗑️  Clearing existing flight instances...");
	// Already handled in main.ts

	// 2. Fetch all schedules with their origin and destination timezones
	// We use aliases to join the airports table twice for origin and destination
	const originAirport = alias(airports, "origin_airport");
	const destinationAirport = alias(airports, "destination_airport");

	const schedules = await db
		.select({
			...getTableColumns(flightSchedules),
			originTimezone: originAirport.timezone,
			destinationTimezone: destinationAirport.timezone,
		})
		.from(flightSchedules)
		.innerJoin(
			originAirport,
			eq(flightSchedules.origin, originAirport.code)
		)
		.innerJoin(
			destinationAirport,
			eq(flightSchedules.destination, destinationAirport.code)
		);

	if (schedules.length === 0) {
		console.error(
			"❌ No schedules found. Please seed flight schedules first."
		);
		return;
	}

	// 3. Generate instances for the next 10 days starting from today
	const newInstances: (typeof flightInstances.$inferInsert)[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Start from beginning of today

	for (let i = 0; i < 10; i++) {
		const currentDate = addDays(today, i);
		const jsDayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

		// Your schema comment: Mon=1<<0, ... Sun=1<<6
		// We map JS day to the bitmask day index (Mon=0, ..., Sun=6)
		const maskDayIndex = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1;
		const dayBit = 1 << maskDayIndex;

		// Filter schedules that operate on the current day of the week
		const activeSchedules = schedules.filter(
			(s) => (s.weekdaysMask & dayBit) !== 0
		);

		for (const schedule of activeSchedules) {
			// Combine date and time for departure
			const departureLocalString = `${format(
				currentDate,
				"yyyy-MM-dd"
			)}T${schedule.departureTimeLocal}`;
			const departureAt = fromZonedTime(
				departureLocalString,
				schedule.originTimezone
			);

			// Determine if arrival is on the next day
			let arrivalDate = currentDate;
			if (schedule.arrivalTimeLocal < schedule.departureTimeLocal) {
				arrivalDate = addDays(currentDate, 1);
			}

			// Combine date and time for arrival
			const arrivalLocalString = `${format(arrivalDate, "yyyy-MM-dd")}T${
				schedule.arrivalTimeLocal
			}`;
			const arrivalAt = fromZonedTime(
				arrivalLocalString,
				schedule.destinationTimezone
			);

			newInstances.push({
				scheduleId: schedule.id,
				flightNumber: schedule.flightNumber,
				airlineName: schedule.airlineName,
				origin: schedule.origin,
				destination: schedule.destination,
				operateDate: format(currentDate, "yyyy-MM-dd"),
				departureAt,
				arrivalAt,
				status: "SCHEDULED", // Only SCHEDULED status
			});
		}
	}

	// 4. Batch insert into the database for performance
	if (newInstances.length > 0) {
		await db.insert(flightInstances).values(newInstances);
	}

	console.log(
		`✅  Seeded ${newInstances.length} new flight instances starting from today.`
	);
}
