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
	console.log("🎯  Ensuring every major hub pair has daily connectivity...");

	// 1. Fetch all schedules with their origin and destination timezones
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

	console.log(`📋 Found ${schedules.length} flight schedules to process`);

	// 2. Generate instances for the next 10 days starting from today
	const newInstances: (typeof flightInstances.$inferInsert)[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Start from beginning of today

	for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
		const currentDate = addDays(today, dayOffset);
		const jsDayOfWeek = currentDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

		// Your schema comment: Mon=1<<0, ... Sun=1<<6
		// We map JS day to the bitmask day index (Mon=0, ..., Sun=6)
		const maskDayIndex = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1;
		const dayBit = 1 << maskDayIndex;

		// Filter schedules that operate on the current day of the week
		const activeSchedules = schedules.filter(
			(schedule) => (schedule.weekdaysMask & dayBit) !== 0
		);

		console.log(
			`📅 Day ${dayOffset + 1} (${format(currentDate, "yyyy-MM-dd")}): ${
				activeSchedules.length
			} active schedules`
		);

		// Process each active schedule for this date
		for (let i = 0; i < activeSchedules.length; i++) {
			const schedule = activeSchedules[i];

			try {
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
				const arrivalLocalString = `${format(
					arrivalDate,
					"yyyy-MM-dd"
				)}T${schedule.arrivalTimeLocal}`;
				const arrivalAt = fromZonedTime(
					arrivalLocalString,
					schedule.destinationTimezone
				);

				const instance = {
					scheduleId: schedule.id,
					flightNumber: schedule.flightNumber,
					airlineName: schedule.airlineName,
					origin: schedule.origin,
					destination: schedule.destination,
					operateDate: format(currentDate, "yyyy-MM-dd"),
					departureAt,
					arrivalAt,
					status: "SCHEDULED" as const, // Only SCHEDULED status
				};

				newInstances.push(instance);
			} catch (error) {
				console.error(
					`⚠️  Error processing schedule ${
						schedule.flightNumber
					} for ${format(currentDate, "yyyy-MM-dd")}:`,
					error
				);
				// Continue processing other schedules
				continue;
			}
		}
	}

	console.log(
		`💾 Preparing to insert ${newInstances.length} flight instances...`
	);

	// 3. Batch insert into the database for performance
	if (newInstances.length > 0) {
		// Insert in batches to avoid memory issues
		const batchSize = 1000;
		let insertedCount = 0;

		for (let i = 0; i < newInstances.length; i += batchSize) {
			const batch = newInstances.slice(i, i + batchSize);
			try {
				await db.insert(flightInstances).values(batch);
				insertedCount += batch.length;
				console.log(
					`   ✅ Inserted batch ${Math.ceil(
						(i + 1) / batchSize
					)} - ${insertedCount}/${newInstances.length} instances`
				);
			} catch (error) {
				console.error(
					`❌ Error inserting batch starting at index ${i}:`,
					error
				);
				throw error;
			}
		}

		console.log(
			`✅  Successfully seeded ${insertedCount} flight instances starting from today.`
		);

		// Show breakdown by day
		const today_str = format(today, "yyyy-MM-dd");
		const todayInstances = newInstances.filter(
			(inst) => inst.operateDate === today_str
		).length;
		console.log(`   📊 Today (${today_str}): ${todayInstances} instances`);
	} else {
		console.log(
			"⚠️  No flight instances to seed. Check if schedules exist and are properly configured."
		);
	}
}
