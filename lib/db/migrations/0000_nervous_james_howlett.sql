-- Add phone_number column to members table
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "phone_number" varchar(50);
