/**
 * Images are downscaled and re-encoded before they touch localStorage.
 * This keeps drafts small (a 5 MB camera photo becomes ~80–150 KB) while
 * preserving enough detail for a guest photo.
 */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are supported.");
  }

  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("That photo is larger than 5 MB. Please choose a smaller one.");
  }

  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process the image.");

    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
