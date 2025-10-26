CREATE TABLE "service_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"vehicle_reg" varchar(20) NOT NULL,
	"service_type" varchar(50) NOT NULL,
	"mileage" integer,
	"labour_hours" integer,
	"parts_used" jsonb,
	"notes" text,
	"media_files" jsonb,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;