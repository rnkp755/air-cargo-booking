import {
	pgTable,
	varchar,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const airports = pgTable("airports", {
	code: varchar("code", { length: 3 }).primaryKey(), // IATA (e.g., DEL)
	name: text("name").notNull(),
	timezone: text("timezone").notNull(), // IANA TZ (e.g., "Asia/Kolkata")
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
