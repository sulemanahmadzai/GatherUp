CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"mobile_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"address" text,
	"registration_number" varchar(20) NOT NULL,
	"make" varchar(100),
	"model" varchar(100),
	"colour" varchar(50),
	"fuel_type" varchar(50),
	"mot_expiry" varchar(20),
	"tax_due_date" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;