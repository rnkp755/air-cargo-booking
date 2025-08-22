import {
	pgEnum,
	pgTable,
	uuid,
	varchar,
	time,
	smallint,
	text,
	timestamp,
	index,
} from "drizzle-orm/pg-core";
import { airports } from "./airports";

export const flightSchedules = pgTable(
	"flight_schedules",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		flightNumber: varchar("flight_number", { length: 16 }).notNull(),
		airlineName: varchar("airline_name", { length: 120 }).notNull(),
		origin: varchar("origin", { length: 3 })
			.notNull()
			.references(() => airports.code),
		destination: varchar("destination", { length: 3 })
			.notNull()
			.references(() => airports.code),
		// Local clock times; timezone derived from airports.timezone
		departureTimeLocal: time("departure_time_local").notNull(),
		arrivalTimeLocal: time("arrival_time_local").notNull(),
		// Bitmask Mon..Sun (Mon=1<<0, ... Sun=1<<6). Use SMALLINT.
		weekdaysMask: smallint("weekdays_mask").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(t) => [index("byOD").on(t.origin, t.destination)]
);
