"use server";

import { z } from "zod";
import { randomBytes } from "node:crypto";
import { connectDB, isValidObjectId, ProductModel, OrderModel, toProduct } from "@/lib/db";

const schema = z.object({
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).min(1, "Your cart is empty."),
  customerName: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,16}$/, "Enter a valid phone number."),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  fulfilment: z.enum(["DELIVERY", "PICKUP"]),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});

export type PlaceOrderInput = z.input<typeof schema>;
export type PlaceOrderResult = { ok: true; reference: string } | { ok: false; error: string };

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeReference() {
  const bytes = randomBytes(6);
  return "ABI-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  const data = parsed.data;
  if (data.fulfilment === "DELIVERY" && (!data.address || !data.city)) {
    return { ok: false, error: "Enter a delivery address and city." };
  }

  // Stock taken so far, so it can be put back if anything fails part-way.
  const taken: { variantId: string; quantity: number }[] = [];
  const restock = () =>
    Promise.all(taken.map((t) => ProductModel.updateOne({ "variants._id": t.variantId }, { $inc: { "variants.$.stock": t.quantity } })));

  try {
    await connectDB();

    // Re-price everything from the database; never trust prices sent by the browser.
    const ids = data.items.map((i) => i.variantId).filter((id) => isValidObjectId(id));
    const products = (await ProductModel.find({ active: true, "variants._id": { $in: ids } }).lean()).map(toProduct);
    const variants = products.flatMap((product) => product.variants.map((v) => ({ ...v, product })));

    const lines = data.items.map((item) => {
      const v = variants.find((x) => x.id === item.variantId);
      if (!v) throw new Error("Something in your cart is no longer available. Remove it and try again.");
      if (v.stock < item.quantity) throw new Error(`Only ${v.stock} left of ${v.product.name} (${v.label}).`);
      return { v, quantity: item.quantity };
    });

    // Take stock only if there is still enough (the check and the decrement happen in one atomic update).
    for (const { v, quantity } of lines) {
      const res = await ProductModel.updateOne(
        { _id: v.product.id, active: true, variants: { $elemMatch: { _id: v.id, stock: { $gte: quantity } } } },
        { $inc: { "variants.$.stock": -quantity } },
      );
      if (res.modifiedCount !== 1) throw new Error(`${v.product.name} (${v.label}) just sold out. Lower the quantity and try again.`);
      taken.push({ variantId: v.id, quantity });
    }

    const order = await OrderModel.create({
      reference: makeReference(),
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || null,
      fulfilment: data.fulfilment,
      address: data.fulfilment === "DELIVERY" ? data.address : null,
      city: data.fulfilment === "DELIVERY" ? data.city : null,
      state: data.fulfilment === "DELIVERY" ? data.state : null,
      note: data.note || null,
      subtotalKobo: lines.reduce((n, l) => n + l.v.priceKobo * l.quantity, 0),
      items: lines.map(({ v, quantity }) => ({
        variantId: v.id,
        productName: v.product.name,
        variantLabel: v.label,
        unitPriceKobo: v.priceKobo,
        quantity,
      })),
    });
    return { ok: true, reference: order.get("reference") as string };
  } catch (e) {
    await restock().catch(() => {});
    return { ok: false, error: e instanceof Error ? e.message : "We couldn’t place your order. Try again." };
  }
}
