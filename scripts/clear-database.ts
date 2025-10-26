/**
 * Script to delete ALL data from the database
 * This keeps the table structure but removes all records
 *
 * Usage: npm run db:clear
 */

import { db, client } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function clearDatabase() {
  try {
    console.log("🗑️  Deleting all data from database...");
    console.log(
      "⚠️  This will remove ALL records but keep the table structure."
    );

    // Truncate all tables with CASCADE to handle foreign keys
    await db.execute(sql`
      TRUNCATE TABLE 
        progress_updates,
        email_logs,
        email_templates,
        invitations,
        rematch_requests,
        match_members,
        matches,
        goals,
        members,
        admin
      CASCADE
    `);

    console.log("✅ All data deleted successfully!");
    console.log("   Tables still exist but are now empty.");
    console.log('   Run "npm run db:seed" to add fresh data.');
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

clearDatabase();
