import {
	pgTable,
	uuid,
	varchar,
	boolean,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { airports } from "./airports";

export const routes = pgTable(
	"routes",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		origin: varchar("origin", { length: 3 })
			.notNull()
			.references(() => airports.code),
		destination: varchar("destination", { length: 3 })
			.notNull()
			.references(() => airports.code),
		// NULL => direct; non-NULL => this row defines an allowed one-stop via that transit
		transitAirport: varchar("transit_airport", { length: 3 }).references(
			() => airports.code
		),
		isActive: boolean("is_active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(t) => [
		uniqueIndex("uniq_route_triple").on(
			t.origin,
			t.destination,
			t.transitAirport
		),
	]
);
