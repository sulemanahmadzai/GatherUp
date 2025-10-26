import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { serviceRecords, staff } from "@/lib/db/schema";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { desc, eq, and, like, or, sql } from "drizzle-orm";
import { uploadMultipleImages, isCloudinaryConfigured } from "@/lib/cloudinary";

// Configure route segment for larger payloads (images)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = "force-dynamic";
// Note: body size limits are not configurable via bodyParser in App Router

// GET /api/service-records - Get all service records with optional filters
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleReg = searchParams.get("vehicleReg");
    const serviceType = searchParams.get("serviceType");
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "10"), 1),
      100
    );
    const offset = (page - 1) * pageSize;

    let query = db
      .select()
      .from(serviceRecords)
      .where(eq(serviceRecords.teamId, team.id));

    // Apply filters if provided
    const conditions = [eq(serviceRecords.teamId, team.id)];

    if (vehicleReg) {
      conditions.push(like(serviceRecords.vehicleReg, `%${vehicleReg}%`));
    }

    if (serviceType) {
      conditions.push(eq(serviceRecords.serviceType, serviceType));
    }

    // Count total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRecords)
      .where(and(...conditions));

    // Optimized query - only select fields needed for list view
    const items = await db
      .select({
        id: serviceRecords.id,
        vehicleReg: serviceRecords.vehicleReg,
        serviceType: serviceRecords.serviceType,
        mileage: serviceRecords.mileage,
        labourHours: serviceRecords.labourHours,
        status: serviceRecords.status,
        createdAt: serviceRecords.createdAt,
        // Exclude heavy fields: beforeImages, afterImages, partsUsed, notes, mediaFiles, assignedStaff, totalCost
      })
      .from(serviceRecords)
      .where(and(...conditions))
      .orderBy(desc(serviceRecords.createdAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({ items, total: Number(count), page, pageSize });
  } catch (error) {
    console.error("Failed to fetch service records:", error);
    return NextResponse.json(
      { error: "Failed to fetch service records" },
      { status: 500 }
    );
  }
}

// POST /api/service-records - Create new service record
export async function POST(request: Request) {
  try {
    console.log("POST /api/service-records - Starting...");

    const user = await getUser();
    if (!user) {
      console.log("POST /api/service-records - No user authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("POST /api/service-records - User:", user.id);

    const team = await getTeamForUser();
    if (!team) {
      console.log("POST /api/service-records - No team found");
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    console.log("POST /api/service-records - Team:", team.id);

    const body = await request.json();
    console.log(
      "POST /api/service-records - Body received, beforeImages:",
      body.beforeImages?.length,
      "afterImages:",
      body.afterImages?.length
    );

    const {
      vehicleReg,
      serviceType,
      mileage,
      labourHours,
      partsUsed,
      notes,
      mediaFiles,
      beforeImages,
      afterImages,
      assignedStaff,
      totalCost,
      status,
    } = body;

    if (!vehicleReg || !serviceType) {
      console.log("POST /api/service-records - Missing required fields");
      return NextResponse.json(
        { error: "Vehicle registration and service type are required" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary (or use base64 if not configured)
    let beforeImageUrls: string[] = [];
    let afterImageUrls: string[] = [];

    const cloudinaryConfigured = isCloudinaryConfigured();

    if (!cloudinaryConfigured) {
      console.warn(
        "⚠️  Cloudinary not configured - storing images as base64 (temporary)"
      );
      console.warn(
        "⚠️  Add CLOUDINARY credentials to .env to enable cloud storage"
      );
      // Fall back to base64 storage
      beforeImageUrls = beforeImages || [];
      afterImageUrls = afterImages || [];
    } else {
      // Upload to Cloudinary
      if (beforeImages && beforeImages.length > 0) {
        console.log(
          "POST /api/service-records - Uploading",
          beforeImages.length,
          "before images to Cloudinary..."
        );
        try {
          beforeImageUrls = await uploadMultipleImages(
            beforeImages,
            "service-records/before"
          );
          console.log(
            "POST /api/service-records - Before images uploaded successfully"
          );
        } catch (error) {
          console.error(
            "POST /api/service-records - Cloudinary upload failed:",
            error
          );
          throw new Error(
            "Failed to upload images to Cloudinary. Check your API credentials."
          );
        }
      }

      if (afterImages && afterImages.length > 0) {
        console.log(
          "POST /api/service-records - Uploading",
          afterImages.length,
          "after images to Cloudinary..."
        );
        try {
          afterImageUrls = await uploadMultipleImages(
            afterImages,
            "service-records/after"
          );
          console.log(
            "POST /api/service-records - After images uploaded successfully"
          );
        } catch (error) {
          console.error(
            "POST /api/service-records - Cloudinary upload failed:",
            error
          );
          throw new Error(
            "Failed to upload images to Cloudinary. Check your API credentials."
          );
        }
      }
    }

    console.log(
      "POST /api/service-records - Inserting record into database..."
    );
    const [newRecord] = await db
      .insert(serviceRecords)
      .values({
        teamId: team.id,
        vehicleReg: vehicleReg.toUpperCase(),
        serviceType,
        mileage: mileage ? parseInt(mileage) : null,
        labourHours: labourHours ? parseInt(labourHours) : null,
        partsUsed: partsUsed || [],
        notes: notes || null,
        mediaFiles: mediaFiles || [],
        beforeImages: beforeImageUrls,
        afterImages: afterImageUrls,
        assignedStaff: assignedStaff || [],
        totalCost: totalCost || null,
        status: status || "pending",
        createdBy: user.id,
      })
      .returning();

    console.log("POST /api/service-records - Record created:", newRecord.id);

    // Update tasks_completed for assigned staff members
    if (assignedStaff && assignedStaff.length > 0) {
      console.log(
        "POST /api/service-records - Updating",
        assignedStaff.length,
        "staff members..."
      );
      for (const staffId of assignedStaff) {
        await db
          .update(staff)
          .set({
            tasksCompleted: sql`tasks_completed + 1`,
          })
          .where(and(eq(staff.id, staffId), eq(staff.teamId, team.id)));
      }
      console.log("POST /api/service-records - Staff updated successfully");
    }

    console.log("POST /api/service-records - Returning response");
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/service-records - Error:", error);
    console.error(
      "❌ Error details:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to create service record",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
