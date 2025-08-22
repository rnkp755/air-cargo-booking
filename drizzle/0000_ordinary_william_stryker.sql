CREATE TYPE "public"."booking_status" AS ENUM('BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."event_entity" AS ENUM('BOOKING', 'FLIGHT');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED', 'STATUS_CHANGED', 'NOTE');--> statement-breakpoint
CREATE TYPE "public"."flight_status" AS ENUM('SCHEDULED', 'DEPARTED', 'ARRIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'OPERATOR', 'VIEWER');--> statement-breakpoint
CREATE TABLE "airports" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_flights" (
	"booking_id" uuid NOT NULL,
	"flight_instance_id" uuid NOT NULL,
	"hop_order" smallint NOT NULL,
	CONSTRAINT "booking_flights_booking_id_hop_order_pk" PRIMARY KEY("booking_id","hop_order")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref_id" varchar(32) NOT NULL,
	"origin" varchar(3) NOT NULL,
	"destination" varchar(3) NOT NULL,
	"pieces" integer NOT NULL,
	"weight_kg" integer NOT NULL,
	"status" "booking_status" DEFAULT 'BOOKED' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_ref_id_unique" UNIQUE("ref_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "event_entity" NOT NULL,
	"entity_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"location" varchar(3),
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid,
	"flight_number" varchar(16) NOT NULL,
	"airline_name" varchar(120) NOT NULL,
	"origin" varchar(3) NOT NULL,
	"destination" varchar(3) NOT NULL,
	"departure_at" timestamp with time zone NOT NULL,
	"arrival_at" timestamp with time zone NOT NULL,
	"operate_date" date NOT NULL,
	"status" "flight_status" DEFAULT 'SCHEDULED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flight_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flight_number" varchar(16) NOT NULL,
	"airline_name" varchar(120) NOT NULL,
	"origin" varchar(3) NOT NULL,
	"destination" varchar(3) NOT NULL,
	"departure_time_local" time NOT NULL,
	"arrival_time_local" time NOT NULL,
	"weekdays_mask" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" varchar(3) NOT NULL,
	"destination" varchar(3) NOT NULL,
	"transit_airport" varchar(3),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'VIEWER' NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flights" ADD CONSTRAINT "booking_flights_flight_instance_id_flight_instances_id_fk" FOREIGN KEY ("flight_instance_id") REFERENCES "public"."flight_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_origin_airports_code_fk" FOREIGN KEY ("origin") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destination_airports_code_fk" FOREIGN KEY ("destination") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_airports_code_fk" FOREIGN KEY ("location") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_instances" ADD CONSTRAINT "flight_instances_schedule_id_flight_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."flight_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_instances" ADD CONSTRAINT "flight_instances_origin_airports_code_fk" FOREIGN KEY ("origin") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_instances" ADD CONSTRAINT "flight_instances_destination_airports_code_fk" FOREIGN KEY ("destination") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_schedules" ADD CONSTRAINT "flight_schedules_origin_airports_code_fk" FOREIGN KEY ("origin") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flight_schedules" ADD CONSTRAINT "flight_schedules_destination_airports_code_fk" FOREIGN KEY ("destination") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_origin_airports_code_fk" FOREIGN KEY ("origin") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_destination_airports_code_fk" FOREIGN KEY ("destination") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_transit_airport_airports_code_fk" FOREIGN KEY ("transit_airport") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "byEntity" ON "events" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "byODD" ON "flight_instances" USING btree ("origin","destination","operate_date");--> statement-breakpoint
CREATE INDEX "byOriginDate" ON "flight_instances" USING btree ("origin","operate_date","departure_at");--> statement-breakpoint
CREATE INDEX "byDestDate" ON "flight_instances" USING btree ("destination","operate_date","arrival_at");--> statement-breakpoint
CREATE INDEX "byOD" ON "flight_schedules" USING btree ("origin","destination");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_route_triple" ON "routes" USING btree ("origin","destination","transit_airport");