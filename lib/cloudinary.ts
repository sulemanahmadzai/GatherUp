import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - The base64 encoded image string
 * @param folder - Optional folder path in Cloudinary (e.g., 'service-records/before')
 * @returns The secure URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  base64Image: string,
  folder: string = "service-records"
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: "auto",
      transformation: [
        { quality: "auto", fetch_format: "auto" }, // Auto-optimize
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Upload multiple base64 images to Cloudinary
 * @param base64Images - Array of base64 encoded image strings
 * @param folder - Optional folder path in Cloudinary
 * @returns Array of secure URLs
 */
export async function uploadMultipleImages(
  base64Images: string[],
  folder: string = "service-records"
): Promise<string[]> {
  try {
    const uploadPromises = base64Images.map((image) =>
      uploadImageToCloudinary(image, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload images to Cloudinary");
  }
}

/**
 * Delete an image from Cloudinary using its public ID
 * @param publicId - The public ID of the image (extracted from URL)
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export function extractPublicId(url: string): string {
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  const folder = parts.slice(parts.indexOf("upload") + 2, -1).join("/");
  return folder ? `${folder}/${publicId}` : publicId;
}

export default cloudinary;
