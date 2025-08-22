import { pgTable, uuid, smallint, primaryKey } from "drizzle-orm/pg-core";
import { bookings } from "./bookings";
import { flightInstances } from "./flightInstances";

export const bookingFlights = pgTable(
	"booking_flights",
	{
		bookingId: uuid("booking_id")
			.notNull()
			.references(() => bookings.id, { onDelete: "cascade" }),
		flightInstanceId: uuid("flight_instance_id")
			.notNull()
			.references(() => flightInstances.id),
		hopOrder: smallint("hop_order").notNull(), // 1 or 2
	},
	(t) => [primaryKey({ columns: [t.bookingId, t.hopOrder] })]
);
