import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
	"ADMIN",
	"OPERATOR",
	"VIEWER",
]);

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	clerkUserId: text("clerk_user_id").notNull().unique(), // from Clerk
	name: text("name").notNull(),
	role: userRoleEnum("role").notNull().default("VIEWER"),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
