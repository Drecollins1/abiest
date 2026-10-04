"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveProduct, type SaveState } from "@/lib/actions/admin";

type VariantRow = { key: string; id?: string; label: string; price: number | ""; stock: number | ""; image?: string | null };
export type ProductFormValues = {
  id: string; name: string; slug: string; category: "CHIPS" | "FLOUR" | "BEANS"; tagline: string; description: string;
  ingredients: string; usage: string; highlights: string; images: string[]; featured: boolean; active: boolean; sortOrder: number;
  variants: { id: string; label: string; price: number; stock: number; image: string | null }[];
};

const newKey = () => Math.random().toString(36).slice(2, 10);

export function ProductForm({ product }: { product?: ProductFormValues }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProduct, null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants.map((v) => ({ ...v, key: v.id })) ?? [{ key: newKey(), label: "", price: "", stock: "" }],
  );

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const setV = (key: string, patch: Partial<VariantRow>) => setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));

  return (
    <form action={action} className="mt-8 space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      {images.map((src) => <input key={src} type="hidden" name="existingImages" value={src} />)}

      <Card title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2">
            <input name="name" className="field" defaultValue={product?.name} placeholder="Crispy plantain chips" required />
          </Field>
          <Field label="Category">
            <select name="category" className="field" defaultValue={product?.category ?? "CHIPS"}>
              <option value="CHIPS">Plantain chips</option>
              <option value="FLOUR">Plantain flour</option>
              <option value="BEANS">Honey beans</option>
            </select>
          </Field>
          <Field label="Page link" hint="Leave empty to build it from the name">
            <div className="flex items-center rounded-xl border border-line bg-mist pl-3 text-sm text-mute focus-within:border-leaf">
              /shop/<input name="slug" className="w-full bg-transparent px-1 py-3 text-[15px] text-ink outline-none" defaultValue={product?.slug} placeholder="crispy-plantain-chips" />
            </div>
          </Field>
          <Field label="Tagline" hint="One line under the name on product cards" className="sm:col-span-2">
            <input name="tagline" className="field" defaultValue={product?.tagline} maxLength={140} required />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={4} className="field" defaultValue={product?.description} required />
          </Field>
        </div>
      </Card>

      <Card title="Photos" description="The first photo is the cover. JPG, PNG or WebP, up to 5MB each. Transparent PNG/WebP packshots look best.">
        <div className="flex flex-wrap gap-4">
          {images.map((src, i) => (
            <div key={src} className="w-32">
              <div className="relative h-40 overflow-hidden rounded-xl bg-mist ring-2 ring-transparent">
                <Image src={src} alt="" fill sizes="128px" className="object-contain p-2" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-leaf px-2 py-0.5 text-xs font-semibold text-white">Cover</span>}
              </div>
              <div className="mt-2 flex justify-between text-xs font-semibold">
                {i > 0 ? <button type="button" className="text-leaf" onClick={() => setImages((im) => [src, ...im.filter((x) => x !== src)])}>Make cover</button> : <span />}
                <button type="button" className="text-dodo" onClick={() => setImages((im) => im.filter((x) => x !== src))}>Remove</button>
              </div>
            </div>
          ))}
          {previews.map((src) => (
            <div key={src} className="w-32">
              <div className="relative h-40 overflow-hidden rounded-xl bg-mist ring-2 ring-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-contain p-2" />
              </div>
              <p className="mt-2 text-xs font-semibold text-mute">New, uploads on save</p>
            </div>
          ))}
          <label className="flex h-40 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-center text-sm font-semibold text-mute hover:border-leaf hover:text-leaf">
            <span className="text-2xl" aria-hidden>+</span>
            Add photos
            <input ref={fileRef} type="file" name="newImages" accept="image/png,image/jpeg,image/webp,image/avif" multiple className="sr-only"
              onChange={(e) => setPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))} />
          </label>
        </div>
        {previews.length > 0 && (
          <button type="button" className="mt-3 text-sm font-semibold text-mute underline underline-offset-4"
            onClick={() => { if (fileRef.current) fileRef.current.value = ""; setPreviews([]); }}>
            Clear new photos
          </button>
        )}
      </Card>

      <Card title="Options & prices" description="Each option is something a customer can pick, like a size or a flavour. Prices are in naira.">
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={v.key} className="grid items-end gap-3 rounded-xl bg-mist p-4 sm:grid-cols-[1.6fr_1fr_.8fr_1.4fr_auto]">
              <Field label="Option name">
                <input className="field" value={v.label} onChange={(e) => setV(v.key, { label: e.target.value })} placeholder={i === 0 ? "e.g. Ripe (Dodo), spiced" : "e.g. Unripe"} />
              </Field>
              <Field label="Price (₦)">
                <input className="field" type="number" min={0} step="50" inputMode="numeric" value={v.price} onChange={(e) => setV(v.key, { price: e.target.value === "" ? "" : Number(e.target.value) })} />
              </Field>
              <Field label="Stock">
                <input className="field" type="number" min={0} inputMode="numeric" value={v.stock} onChange={(e) => setV(v.key, { stock: e.target.value === "" ? "" : Number(e.target.value) })} />
              </Field>
              <Field label="Option photo" hint={v.image ? "Has a photo" : "Optional"}>
                <input type="file" name={`variantFile-${v.key}`} accept="image/png,image/jpeg,image/webp" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold" />
              </Field>
              <button type="button" disabled={variants.length === 1}
                onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                className="h-12 rounded-xl px-3 text-sm font-semibold text-dodo disabled:opacity-30" aria-label={`Remove option ${v.label || i + 1}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-outline mt-4" onClick={() => setVariants((vs) => [...vs, { key: newKey(), label: "", price: "", stock: "" }])}>
          Add option
        </button>
      </Card>

      <Card title="Label details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ingredients"><textarea name="ingredients" rows={3} className="field" defaultValue={product?.ingredients} /></Field>
          <Field label="How to use / cooking instructions"><textarea name="usage" rows={3} className="field" defaultValue={product?.usage} /></Field>
          <Field label="Highlights" hint="One per line, e.g. No additives" className="sm:col-span-2">
            <textarea name="highlights" rows={3} className="field" defaultValue={product?.highlights} />
          </Field>
        </div>
      </Card>

      <Card title="Visibility">
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-[15px] font-medium"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-5 w-5 accent-[#005210]" /> Show in shop</label>
          <label className="flex items-center gap-2 text-[15px] font-medium"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="h-5 w-5 accent-[#005210]" /> Feature on home page</label>
          <label className="flex items-center gap-2 text-[15px] font-medium">Order <input type="number" name="sortOrder" defaultValue={product?.sortOrder ?? 0} className="field w-20 py-2" /></label>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t border-line bg-mist/95 px-5 py-4 backdrop-blur sm:-mx-10 sm:px-10">
        <p className="text-sm font-medium text-dodo" role="alert">{state?.error}</p>
        <div className="flex gap-3">
          <Link href="/dashboard/products" className="btn-outline">Cancel</Link>
          <button className="btn-leaf px-8" disabled={pending}>{pending ? "Saving…" : product ? "Save changes" : "Add product"}</button>
        </div>
      </div>
    </form>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-mute">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}{hint && <span className="ml-2 font-normal text-mute">{hint}</span>}</span>
      {children}
    </label>
  );
}
