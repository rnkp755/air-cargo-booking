import {
	pgEnum,
	pgTable,
	uuid,
	varchar,
	integer,
	timestamp,
} from "drizzle-orm/pg-core";
import { airports } from "./airports";
import { users } from "./users";

export const bookingStatusEnum = pgEnum("booking_status", [
	"BOOKED",
	"DEPARTED",
	"ARRIVED",
	"DELIVERED",
	"CANCELLED",
]);

export const bookings = pgTable("bookings", {
	id: uuid("id").defaultRandom().primaryKey(),
	refId: varchar("ref_id", { length: 32 }).notNull().unique(), // human-friendly
	origin: varchar("origin", { length: 3 })
		.notNull()
		.references(() => airports.code),
	destination: varchar("destination", { length: 3 })
		.notNull()
		.references(() => airports.code),
	pieces: integer("pieces").notNull(),
	weightKg: integer("weight_kg").notNull(),
	status: bookingStatusEnum("status").notNull().default("BOOKED"),
	createdBy: uuid("created_by").references(() => users.id),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
