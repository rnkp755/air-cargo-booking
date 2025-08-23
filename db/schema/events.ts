import {
	pgEnum,
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { airports } from "./airports";

export const eventEntityEnum = pgEnum("event_entity", ["BOOKING"]);
export const eventTypeEnum = pgEnum("event_type", [
	"BOOKED",
	"DEPARTED",
	"ARRIVED",
	"DELIVERED",
	"CANCELLED",
]);

export const events = pgTable(
	"events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		entityType: eventEntityEnum("entity_type").notNull(),
		entityId: uuid("entity_id").notNull(), // booking.id or flight_instances.id
		eventType: eventTypeEnum("event_type").notNull(),
		location: varchar("location", { length: 3 }).references(
			() => airports.code
		),
		description: text("description"),
		createdBy: uuid("created_by").references(() => users.id),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(t) => [index("byEntity").on(t.entityType, t.entityId, t.createdAt)]
);
