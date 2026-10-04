import "dotenv/config";
import mongoose, { Schema, Types, model, models, isValidObjectId, type Model } from "mongoose";

/* ------------------------------ connection ------------------------------ */

// One connection per server process; reuse it across hot reloads in dev.
const globalForMongo = globalThis as unknown as { mongoose?: Promise<typeof mongoose> };

export function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set. Add it to .env.");
  globalForMongo.mongoose ??= mongoose.connect(process.env.MONGODB_URI).catch((e) => {
    globalForMongo.mongoose = undefined; // let the next request retry
    throw e;
  });
  return globalForMongo.mongoose;
}

export { isValidObjectId };

/* --------------------------------- types -------------------------------- */

export const CATEGORIES = ["CHIPS", "FLOUR", "BEANS"] as const;
export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"] as const;
export const FULFILMENTS = ["DELIVERY", "PICKUP"] as const;
export const INQUIRY_TYPES = ["EVENT", "BULK", "CONTACT"] as const;
export const INQUIRY_STATUSES = ["NEW", "HANDLED"] as const;

export type Category = (typeof CATEGORIES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Fulfilment = (typeof FULFILMENTS)[number];
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

// Plain shapes handed to pages and components (`_id` becomes a string `id`).
export type Variant = {
  id: string;
  label: string;      // e.g. "Ripe (Dodo), spiced", "2kg"
  priceKobo: number;  // money is stored in kobo
  stock: number;
  image: string | null; // optional image shown when this option is picked
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: Category;
  tagline: string;
  description: string;
  ingredients: string | null;
  usage: string | null; // cooking instructions / directions for use
  highlights: string[]; // e.g. "No additives", "Stone free"
  images: string[];     // first image is the cover
  featured: boolean;
  active: boolean;
  sortOrder: number;
  variants: Variant[];
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: string;
  variantId: string | null;
  productName: string; // snapshot, so old orders stay readable after edits
  variantLabel: string;
  unitPriceKobo: number;
  quantity: number;
};

export type Order = {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  note: string | null;
  fulfilment: Fulfilment;
  subtotalKobo: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  eventDate: Date | null;
  quantity: string | null;
  products: string[];
  message: string;
  status: InquiryStatus;
  createdAt: Date;
};

/* -------------------------------- schemas ------------------------------- */

const variantSchema = new Schema({
  label: { type: String, required: true },
  priceKobo: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String, default: null },
  sortOrder: { type: Number, default: 0 },
});

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: CATEGORIES, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: String, default: null },
    usage: { type: String, default: null },
    highlights: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    variants: { type: [variantSchema], default: [] }, // embedded: a product and its options live in one document
  },
  { timestamps: true },
);
productSchema.index({ "variants._id": 1 });

const orderItemSchema = new Schema({
  variantId: { type: Schema.Types.ObjectId, default: null },
  productName: { type: String, required: true },
  variantLabel: { type: String, required: true },
  unitPriceKobo: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    note: { type: String, default: null },
    fulfilment: { type: String, enum: FULFILMENTS, default: "DELIVERY" },
    subtotalKobo: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "PENDING" },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: true },
);
orderSchema.index({ status: 1, createdAt: -1 });

const inquirySchema = new Schema(
  {
    type: { type: String, enum: INQUIRY_TYPES, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    organization: { type: String, default: null },
    eventDate: { type: Date, default: null },
    quantity: { type: String, default: null },
    products: { type: [String], default: [] },
    message: { type: String, required: true },
    status: { type: String, enum: INQUIRY_STATUSES, default: "NEW" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Reuse compiled models across hot reloads.
export const ProductModel = (models.Product as Model<unknown>) ?? model("Product", productSchema);
export const OrderModel = (models.Order as Model<unknown>) ?? model("Order", orderSchema);
export const InquiryModel = (models.Inquiry as Model<unknown>) ?? model("Inquiry", inquirySchema);

/* ------------------------------- helpers -------------------------------- */

// Turn a lean Mongo document into a plain object: `_id` → `id`, ObjectIds → strings, no `__v`.
function plain(v: unknown): unknown {
  if (v instanceof Types.ObjectId) return v.toString();
  if (Array.isArray(v)) return v.map(plain);
  if (v === null || typeof v !== "object" || v instanceof Date) return v;
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v)) {
    if (k === "__v") continue;
    out[k === "_id" ? "id" : k] = plain(val);
  }
  return out;
}

export function toProduct(doc: unknown): Product {
  const p = plain(doc) as Product;
  p.variants.sort((a, b) => a.sortOrder - b.sortOrder);
  return p;
}
export const toOrder = (doc: unknown) => plain(doc) as Order;
export const toInquiry = (doc: unknown) => plain(doc) as Inquiry;
