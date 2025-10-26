import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { serviceRecords, staff } from "@/lib/db/schema";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { eq, and, sql } from "drizzle-orm";
import {
  uploadMultipleImages,
  isCloudinaryConfigured,
  deleteImageFromCloudinary,
  extractPublicId,
} from "@/lib/cloudinary";

// GET /api/service-records/[id] - Get single service record
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { id } = await params;
    const recordId = parseInt(id);
    const [record] = await db
      .select()
      .from(serviceRecords)
      .where(
        and(eq(serviceRecords.id, recordId), eq(serviceRecords.teamId, team.id))
      )
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "Service record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to fetch service record:", error);
    return NextResponse.json(
      { error: "Failed to fetch service record" },
      { status: 500 }
    );
  }
}

// PUT /api/service-records/[id] - Update service record
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { id } = await params;
    const recordId = parseInt(id);

    // Get the existing record to compare assigned staff
    const [existingRecord] = await db
      .select()
      .from(serviceRecords)
      .where(
        and(eq(serviceRecords.id, recordId), eq(serviceRecords.teamId, team.id))
      )
      .limit(1);

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Service record not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
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

    // Process images: separate existing URLs from new base64 images
    let beforeImageUrls: string[] = [];
    let afterImageUrls: string[] = [];

    const cloudinaryConfigured = isCloudinaryConfigured();

    if (beforeImages && beforeImages.length > 0) {
      const existingUrls = beforeImages.filter((img: string) =>
        img.startsWith("http")
      );
      const newImages = beforeImages.filter((img: string) =>
        img.startsWith("data:")
      );

      if (newImages.length > 0) {
        if (cloudinaryConfigured) {
          try {
            const uploadedUrls = await uploadMultipleImages(
              newImages,
              "service-records/before"
            );
            beforeImageUrls = [...existingUrls, ...uploadedUrls];
          } catch (error) {
            console.error(
              "PUT /api/service-records/[id] - Cloudinary upload failed:",
              error
            );
            throw new Error(
              "Failed to upload images to Cloudinary. Check your API credentials."
            );
          }
        } else {
          // Fall back to base64 if Cloudinary not configured
          console.warn(
            "⚠️  Cloudinary not configured - storing new images as base64"
          );
          beforeImageUrls = [...existingUrls, ...newImages];
        }
      } else {
        beforeImageUrls = existingUrls;
      }
    }

    if (afterImages && afterImages.length > 0) {
      const existingUrls = afterImages.filter((img: string) =>
        img.startsWith("http")
      );
      const newImages = afterImages.filter((img: string) =>
        img.startsWith("data:")
      );

      if (newImages.length > 0) {
        if (cloudinaryConfigured) {
          try {
            const uploadedUrls = await uploadMultipleImages(
              newImages,
              "service-records/after"
            );
            afterImageUrls = [...existingUrls, ...uploadedUrls];
          } catch (error) {
            console.error(
              "PUT /api/service-records/[id] - Cloudinary upload failed:",
              error
            );
            throw new Error(
              "Failed to upload images to Cloudinary. Check your API credentials."
            );
          }
        } else {
          // Fall back to base64 if Cloudinary not configured
          console.warn(
            "⚠️  Cloudinary not configured - storing new images as base64"
          );
          afterImageUrls = [...existingUrls, ...newImages];
        }
      } else {
        afterImageUrls = existingUrls;
      }
    }

    // Delete removed images from Cloudinary
    if (isCloudinaryConfigured()) {
      const oldBeforeImages = (existingRecord.beforeImages as string[]) || [];
      const oldAfterImages = (existingRecord.afterImages as string[]) || [];
      const newBeforeImages = beforeImageUrls || [];
      const newAfterImages = afterImageUrls || [];

      // Find images that were removed
      const removedBeforeImages = oldBeforeImages.filter(
        (oldUrl: string) => !newBeforeImages.includes(oldUrl)
      );
      const removedAfterImages = oldAfterImages.filter(
        (oldUrl: string) => !newAfterImages.includes(oldUrl)
      );

      const allRemovedImages = [...removedBeforeImages, ...removedAfterImages];

      if (allRemovedImages.length > 0) {
        console.log(
          `🗑️  Deleting ${allRemovedImages.length} removed images from Cloudinary...`
        );

        // Delete removed images from Cloudinary
        for (const imageUrl of allRemovedImages) {
          if (imageUrl.startsWith("https://res.cloudinary.com")) {
            try {
              const publicId = extractPublicId(imageUrl);
              await deleteImageFromCloudinary(publicId);
              console.log(
                "✅ Deleted removed image from Cloudinary:",
                publicId
              );
            } catch (error) {
              console.error("⚠️  Failed to delete image:", error);
              // Continue anyway - don't fail the update operation
            }
          }
        }
      }
    }

    const [updatedRecord] = await db
      .update(serviceRecords)
      .set({
        vehicleReg: vehicleReg ? vehicleReg.toUpperCase() : undefined,
        serviceType,
        mileage: mileage ? parseInt(mileage) : null,
        labourHours: labourHours ? parseInt(labourHours) : null,
        partsUsed,
        notes,
        mediaFiles,
        beforeImages:
          beforeImageUrls.length > 0 ? beforeImageUrls : beforeImages,
        afterImages: afterImageUrls.length > 0 ? afterImageUrls : afterImages,
        assignedStaff,
        totalCost,
        status,
        updatedAt: new Date(),
      })
      .where(
        and(eq(serviceRecords.id, recordId), eq(serviceRecords.teamId, team.id))
      )
      .returning();

    // Update tasks_completed for staff assignment changes
    if (assignedStaff !== undefined) {
      const oldStaff = (existingRecord.assignedStaff as number[]) || [];
      const newStaff = assignedStaff || [];

      // Find staff that were removed
      const removedStaff = oldStaff.filter(
        (id: number) => !newStaff.includes(id)
      );

      // Find staff that were added
      const addedStaff = newStaff.filter(
        (id: number) => !oldStaff.includes(id)
      );

      // Decrement tasks for removed staff
      for (const staffId of removedStaff) {
        await db
          .update(staff)
          .set({
            tasksCompleted: sql`GREATEST(0, tasks_completed - 1)`,
          })
          .where(and(eq(staff.id, staffId), eq(staff.teamId, team.id)));
      }

      // Increment tasks for added staff
      for (const staffId of addedStaff) {
        await db
          .update(staff)
          .set({
            tasksCompleted: sql`tasks_completed + 1`,
          })
          .where(and(eq(staff.id, staffId), eq(staff.teamId, team.id)));
      }
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Failed to update service record:", error);
    return NextResponse.json(
      { error: "Failed to update service record" },
      { status: 500 }
    );
  }
}

// DELETE /api/service-records/[id] - Delete service record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { id } = await params;
    const recordId = parseInt(id);

    // Get the record first to access images
    const [record] = await db
      .select()
      .from(serviceRecords)
      .where(
        and(eq(serviceRecords.id, recordId), eq(serviceRecords.teamId, team.id))
      )
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Delete images from Cloudinary (if configured)
    if (isCloudinaryConfigured()) {
      const allImages = [
        ...(record.beforeImages || []),
        ...(record.afterImages || []),
      ];

      console.log(`🗑️  Deleting ${allImages.length} images from Cloudinary...`);

      for (const imageUrl of allImages) {
        // Only delete Cloudinary URLs (not base64)
        if (imageUrl.startsWith("https://res.cloudinary.com")) {
          try {
            const publicId = extractPublicId(imageUrl);
            await deleteImageFromCloudinary(publicId);
            console.log("✅ Deleted from Cloudinary:", publicId);
          } catch (error) {
            console.error("⚠️  Failed to delete image from Cloudinary:", error);
            // Continue anyway - don't fail the delete operation
          }
        }
      }
    }

    // Delete the database record
    await db
      .delete(serviceRecords)
      .where(
        and(eq(serviceRecords.id, recordId), eq(serviceRecords.teamId, team.id))
      );

    return NextResponse.json({
      message: "Service record deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete service record:", error);
    return NextResponse.json(
      { error: "Failed to delete service record" },
      { status: 500 }
    );
  }
}
