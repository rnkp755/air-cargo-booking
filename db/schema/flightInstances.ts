import {
	pgEnum,
	pgTable,
	uuid,
	varchar,
	timestamp,
	date,
	index,
} from "drizzle-orm/pg-core";
import { airports } from "./airports";
import { flightSchedules } from "./flightSchedules";

export const flightStatusEnum = pgEnum("flight_status", [
	"SCHEDULED",
	"DEPARTED",
	"ARRIVED",
	"CANCELLED",
]);

export const flightInstances = pgTable(
	"flight_instances",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		scheduleId: uuid("schedule_id").references(() => flightSchedules.id),
		flightNumber: varchar("flight_number", { length: 16 }).notNull(), // denormalized for speed
		airlineName: varchar("airline_name", { length: 120 }).notNull(),
		origin: varchar("origin", { length: 3 })
			.notNull()
			.references(() => airports.code),
		destination: varchar("destination", { length: 3 })
			.notNull()
			.references(() => airports.code),
		departureAt: timestamp("departure_at", {
			withTimezone: true,
		}).notNull(),
		arrivalAt: timestamp("arrival_at", { withTimezone: true }).notNull(),
		operateDate: date("operate_date").notNull(), // calendar date at origin
		status: flightStatusEnum("status").notNull().default("SCHEDULED"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(t) => [
		index("byODD").on(t.origin, t.destination, t.operateDate),
		index("byOriginDate").on(t.origin, t.operateDate, t.departureAt),
		index("byDestDate").on(t.destination, t.operateDate, t.arrivalAt),
	]
);
