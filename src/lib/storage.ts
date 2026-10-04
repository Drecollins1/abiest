import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Local-disk storage: files land in /public/uploads and are served by Next.
 * Fine for a VPS or Docker volume. On serverless hosting (e.g. Vercel) the disk is
 * not persistent, so swap these two functions for S3 / Cloudinary uploads.
 */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function saveImage(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) throw new Error("Each image must be under 5MB.");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deleteImage(url: string) {
  if (!url.startsWith("/uploads/")) return; // never touch bundled /products images
  await unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
}
