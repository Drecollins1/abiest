"use server";

import { z } from "zod";
import { connectDB, InquiryModel } from "@/lib/db";

const schema = z.object({
  type: z.enum(["EVENT", "BULK", "CONTACT"]),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,16}$/, "Enter a valid phone number."),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  organization: z.string().trim().max(120).optional(),
  eventDate: z.string().optional(),
  quantity: z.string().trim().max(120).optional(),
  products: z.array(z.string()).default([]),
  message: z.string().trim().min(5, "Tell us a little more.").max(2000),
  website: z.string().max(0).optional(), // honeypot: real people leave this empty
});

export type InquiryState = { ok: boolean; error?: string } | null;

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const parsed = schema.safeParse({
    type: form.get("type"),
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email") ?? "",
    organization: form.get("organization") ?? undefined,
    eventDate: form.get("eventDate") || undefined,
    quantity: form.get("quantity") ?? undefined,
    products: form.getAll("products").map(String),
    message: form.get("message"),
    website: form.get("website") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  const { website: _hp, eventDate, email, ...data } = parsed.data;

  await connectDB();
  await InquiryModel.create({ ...data, email: email || null, eventDate: eventDate ? new Date(eventDate) : null });
  return { ok: true };
}
