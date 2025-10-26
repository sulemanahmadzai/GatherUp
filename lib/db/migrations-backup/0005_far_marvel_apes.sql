CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"gender" varchar(20),
	"date_of_birth" varchar(20),
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"address" text,
	"role" varchar(100),
	"department" varchar(100),
	"joining_date" varchar(20),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"shift_time" varchar(100),
	"salary" varchar(50),
	"payment_type" varchar(50),
	"last_payment_date" varchar(20),
	"tasks_completed" integer DEFAULT 0,
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"relationship" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;