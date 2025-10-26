import { client } from "../lib/db/drizzle";

async function diagnose() {
  try {
    console.log("🔍 Database Performance Diagnostics\n");

    // Test 1: Connection latency
    console.log("1️⃣ Testing database connection latency...");
    const pingStart = Date.now();
    await client.unsafe("SELECT 1");
    const pingTime = Date.now() - pingStart;
    console.log(
      `   ✓ Ping: ${pingTime}ms ${pingTime > 100 ? "⚠️ HIGH" : "✅ GOOD"}\n`
    );

    // Test 2: Check if indexes exist on users table
    console.log("2️⃣ Checking users table indexes...");
    const userIndexes = await client.unsafe(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'users'
      ORDER BY indexname;
    `);

    console.log(`   Found ${userIndexes.length} indexes on users table:`);
    userIndexes.forEach((idx: any) => {
      console.log(`   - ${idx.indexname}`);
      if (
        idx.indexname.includes("deleted") ||
        idx.indexname.includes("active")
      ) {
        console.log(`     ${idx.indexdef}`);
      }
    });
    console.log();

    // Test 3: Test actual user query performance
    console.log("3️⃣ Testing user query (ID=2) performance...");
    const userQueryStart = Date.now();
    const userResult = await client.unsafe(`
      SELECT * FROM users 
      WHERE id = 2 AND deleted_at IS NULL 
      LIMIT 1;
    `);
    const userQueryTime = Date.now() - userQueryStart;
    console.log(
      `   ✓ Query time: ${userQueryTime}ms ${
        userQueryTime > 100 ? "⚠️ SLOW" : "✅ FAST"
      }`
    );
    console.log(`   ✓ Result: ${userResult.length} row(s) returned\n`);

    // Test 4: Check if index is being used (EXPLAIN)
    console.log("4️⃣ Checking query execution plan (EXPLAIN)...");
    const explainResult = await client.unsafe(`
      EXPLAIN (FORMAT JSON) 
      SELECT * FROM users 
      WHERE id = 2 AND deleted_at IS NULL 
      LIMIT 1;
    `);

    const plan = explainResult[0]["QUERY PLAN"][0];
    console.log(`   Execution time: ${plan["Execution Time"] || "N/A"}ms`);
    console.log(`   Plan:\n${JSON.stringify(plan, null, 2)}\n`);

    // Test 5: Check total rows in users table
    console.log("5️⃣ Checking users table size...");
    const countResult = await client.unsafe(`
      SELECT COUNT(*) as total FROM users;
    `);
    console.log(`   Total users: ${countResult[0].total}\n`);

    // Test 6: Database location/region info
    console.log("6️⃣ Database information...");
    const dbInfo = await client.unsafe(`
      SELECT version();
    `);
    console.log(`   ${dbInfo[0].version}\n`);

    // Summary
    console.log("📊 DIAGNOSIS SUMMARY:");
    console.log("━".repeat(50));

    if (pingTime > 200) {
      console.log("⚠️  HIGH DATABASE LATENCY DETECTED!");
      console.log(`   - Database ping: ${pingTime}ms`);
      console.log(`   - This is likely geographic distance`);
      console.log(`   - Consider using a database closer to your location`);
    }

    if (userQueryTime > 100) {
      console.log("⚠️  USER QUERY IS SLOW!");
      console.log(`   - Query time: ${userQueryTime}ms`);
      console.log(`   - Network latency might be the main cause`);
    }

    if (pingTime < 100 && userQueryTime > 100) {
      console.log("⚠️  QUERY IS SLOW DESPITE GOOD NETWORK");
      console.log("   - This suggests missing or unused indexes");
      console.log("   - Check the EXPLAIN output above");
    }

    if (pingTime < 50 && userQueryTime < 50) {
      console.log("✅ DATABASE PERFORMANCE IS EXCELLENT!");
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await client.end();
    process.exit(1);
  }
}

diagnose();

