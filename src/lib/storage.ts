import mongoose, { Types, isValidObjectId } from "mongoose";
import { connectDB } from "./db";

/**
 * Uploaded photos are stored in MongoDB (GridFS, bucket "images") and served by
 * /api/images/[file]. Nothing is written to disk, so this works on serverless hosts like Vercel.
 */
const PREFIX = "/api/images/";
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const MAX_BYTES = 4 * 1024 * 1024; // Vercel rejects request bodies over 4.5MB

export async function imageBucket() {
  await connectDB();
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: "images" });
}

export async function saveImage(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new Error("Upload a JPG, PNG, WebP or AVIF image.");
  if (file.size > MAX_BYTES) throw new Error("Each image must be under 4MB.");
  const data = Buffer.from(await file.arrayBuffer());
  const bucket = await imageBucket();
  const id = new Types.ObjectId();
  const name = `${id}.${ext}`;
  await new Promise<void>((resolve, reject) => {
    bucket
      .openUploadStreamWithId(id, name, { metadata: { contentType: file.type } })
      .on("finish", () => resolve())
      .on("error", reject)
      .end(data);
  });
  return PREFIX + name;
}

/** Parses "/api/images/<id>.<ext>" (or just "<id>.<ext>") into a GridFS id. */
export function imageIdFrom(urlOrFile: string) {
  const id = urlOrFile.replace(PREFIX, "").split(".")[0];
  return isValidObjectId(id) ? new Types.ObjectId(id) : null;
}

export async function deleteImage(url: string) {
  if (!url.startsWith(PREFIX)) return; // never touch bundled /products images
  const id = imageIdFrom(url);
  if (!id) return;
  const bucket = await imageBucket();
  await bucket.delete(id).catch(() => {}); // already gone is fine
}
