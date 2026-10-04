"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import {
  connectDB, isValidObjectId, ProductModel, OrderModel, InquiryModel, toProduct, toOrder,
  type OrderStatus, type InquiryStatus,
} from "@/lib/db";
import { requireAdmin, createSession, destroySession } from "@/lib/auth";
import { saveImage, deleteImage } from "@/lib/storage";
import { nairaToKobo } from "@/lib/money";
import { timingSafeEqual } from "node:crypto";

/* ------------------------------ auth ------------------------------ */

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function login(_prev: { error?: string } | null, form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ok =
    !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD &&
    safeEq(email, process.env.ADMIN_EMAIL.toLowerCase()) && safeEq(password, process.env.ADMIN_PASSWORD);
  if (!ok) return { error: "That email and password don’t match." };
  await createSession(email);
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/dashboard/login");
}

/* ---------------------------- products ---------------------------- */

const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const variantSchema = z.object({
  key: z.string(),            // client-side key, used to find this variant's uploaded file
  id: z.string().optional(),  // present when editing an existing variant
  label: z.string().trim().min(1, "Every option needs a name, e.g. “2kg”."),
  price: z.coerce.number().min(0, "Price can’t be negative."),
  stock: z.coerce.number().int().min(0, "Stock can’t be negative."),
  image: z.string().nullable().optional(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Give the product a name."),
  slug: z.string().trim().optional(),
  category: z.enum(["CHIPS", "FLOUR", "BEANS"]),
  tagline: z.string().trim().min(2, "Add a one-line tagline.").max(140),
  description: z.string().trim().min(10, "Add a short description."),
  ingredients: z.string().trim().optional(),
  usage: z.string().trim().optional(),
  highlights: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().default(0),
  variants: z.array(variantSchema).min(1, "Add at least one option with a price."),
});

export type SaveState = { error?: string } | null;

export async function saveProduct(_prev: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();

  let variantsRaw: unknown = [];
  try { variantsRaw = JSON.parse(String(form.get("variants") ?? "[]")); } catch {}

  const parsed = productSchema.safeParse({
    id: form.get("id") || undefined,
    name: form.get("name"),
    slug: form.get("slug") || undefined,
    category: form.get("category"),
    tagline: form.get("tagline"),
    description: form.get("description"),
    ingredients: form.get("ingredients") || undefined,
    usage: form.get("usage") || undefined,
    highlights: form.get("highlights") || "",
    featured: form.get("featured") === "on",
    active: form.get("active") === "on",
    sortOrder: form.get("sortOrder") || 0,
    variants: variantsRaw,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);

  if (d.id && !isValidObjectId(d.id)) return { error: "This product no longer exists." };
  await connectDB();
  const clash = await ProductModel.exists({ slug, ...(d.id ? { _id: { $ne: d.id } } : {}) });
  if (clash) return { error: `Another product already uses the link “${slug}”. Change the name or link.` };

  // Images: keep the ones still listed (in their new order), then append fresh uploads.
  let images = form.getAll("existingImages").map(String);
  try {
    for (const f of form.getAll("newImages")) {
      if (f instanceof File && f.size > 0) images.push(await saveImage(f));
    }
    for (const v of d.variants) {
      const f = form.get(`variantFile-${v.key}`);
      if (f instanceof File && f.size > 0) v.image = await saveImage(f);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }
  if (!images.length) return { error: "Add at least one product image." };

  const base = {
    name: d.name,
    slug,
    category: d.category,
    tagline: d.tagline,
    description: d.description,
    ingredients: d.ingredients ?? null,
    usage: d.usage ?? null,
    highlights: (d.highlights ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
    images,
    featured: d.featured,
    active: d.active,
    sortOrder: d.sortOrder,
  };
  const variantData = (v: z.infer<typeof variantSchema>, i: number) => ({
    label: v.label, priceKobo: nairaToKobo(v.price), stock: v.stock, image: v.image ?? null, sortOrder: i,
  });

  if (d.id) {
    const beforeDoc = await ProductModel.findById(d.id).lean();
    if (!beforeDoc) return { error: "This product no longer exists." };
    const before = toProduct(beforeDoc);
    const known = new Set(before.variants.map((v) => v.id));

    // Variants are embedded, so the whole product (and its options) is replaced in one atomic write.
    await ProductModel.updateOne({ _id: d.id }, {
      $set: {
        ...base,
        variants: d.variants.map((v, i) => ({
          _id: v.id && known.has(v.id) ? new Types.ObjectId(v.id) : new Types.ObjectId(),
          ...variantData(v, i),
        })),
      },
    });

    // Clean up uploaded files that are no longer referenced.
    const stillUsed = new Set([...images, ...d.variants.map((v) => v.image).filter(Boolean)]);
    const old = [...before.images, ...before.variants.map((v) => v.image).filter(Boolean)] as string[];
    await Promise.all(old.filter((u) => !stillUsed.has(u)).map(deleteImage));
  } else {
    await ProductModel.create({ ...base, variants: d.variants.map(variantData) });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard/products?saved=1");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  const doc = await ProductModel.findByIdAndDelete(id).lean();
  if (!doc) return;
  const p = toProduct(doc);
  await Promise.all([...p.images, ...p.variants.map((v) => v.image ?? "")].map(deleteImage));
  revalidatePath("/", "layout");
}

export async function toggleProductActive(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  // Flip the flag in a single update so two quick clicks can't race.
  await ProductModel.updateOne({ _id: id }, [{ $set: { active: { $not: "$active" } } }]);
  revalidatePath("/", "layout");
}

/* ----------------------------- orders ----------------------------- */

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  // Swap the status atomically and get the previous version back.
  const prev = await OrderModel.findOneAndUpdate({ _id: id, status: { $ne: status } }, { $set: { status } }).lean();
  if (prev) {
    const order = toOrder(prev);
    // Put stock back when an order is cancelled, take it again if it's revived.
    const delta = status === "CANCELLED" ? 1 : order.status === "CANCELLED" ? -1 : 0;
    if (delta) {
      for (const i of order.items) {
        if (i.variantId) {
          await ProductModel.updateOne({ "variants._id": i.variantId }, { $inc: { "variants.$.stock": delta * i.quantity } });
        }
      }
    }
  }
  revalidatePath("/dashboard", "layout");
}

/* ---------------------------- inquiries --------------------------- */

export async function setInquiryStatus(id: string, status: InquiryStatus) {
  await requireAdmin();
  if (!isValidObjectId(id)) return;
  await connectDB();
  await InquiryModel.updateOne({ _id: id }, { $set: { status } });
  revalidatePath("/dashboard", "layout");
}
