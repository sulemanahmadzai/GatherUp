ALTER TABLE "service_records" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "service_records" ADD COLUMN "before_images" jsonb;--> statement-breakpoint
ALTER TABLE "service_records" ADD COLUMN "after_images" jsonb;--> statement-breakpoint
ALTER TABLE "service_records" ADD COLUMN "assigned_staff" jsonb;--> statement-breakpoint
ALTER TABLE "service_records" ADD COLUMN "total_cost" varchar(50);