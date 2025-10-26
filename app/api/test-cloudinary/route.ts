import { NextResponse } from "next/server";
import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

export async function GET() {
  try {
    // Check if environment variables are set
    const envCheck = {
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
        !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "NOT SET",
      apiKey: process.env.CLOUDINARY_API_KEY
        ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
        : "NOT SET",
    };

    const configured = isCloudinaryConfigured();

    if (!configured) {
      return NextResponse.json({
        status: "NOT CONFIGURED",
        message: "Cloudinary environment variables are missing",
        environment: envCheck,
        help:
          "Add these to your .env file:\n" +
          "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name\n" +
          "CLOUDINARY_API_KEY=your-api-key\n" +
          "CLOUDINARY_API_SECRET=your-api-secret",
      });
    }

    // Test with a small 1x1 pixel red image (base64)
    const testImage =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    console.log("🧪 Testing Cloudinary upload...");
    const uploadedUrl = await uploadImageToCloudinary(testImage, "test");
    console.log("✅ Cloudinary test upload successful!");

    return NextResponse.json({
      status: "SUCCESS",
      message: "Cloudinary is configured and working!",
      environment: envCheck,
      testUpload: {
        success: true,
        url: uploadedUrl,
        note: "Test image uploaded successfully. You can delete this from Cloudinary dashboard.",
      },
    });
  } catch (error) {
    console.error("❌ Cloudinary test failed:", error);

    return NextResponse.json(
      {
        status: "ERROR",
        message: "Cloudinary is configured but upload failed",
        error: error instanceof Error ? error.message : String(error),
        help: "Check if your API credentials are correct in Cloudinary dashboard",
      },
      { status: 500 }
    );
  }
}
