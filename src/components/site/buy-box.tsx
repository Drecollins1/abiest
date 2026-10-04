"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatNaira } from "@/lib/money";
import { useCart } from "./cart";

type V = { id: string; label: string; priceKobo: number; stock: number; image: string | null };
type Props = {
  product: { slug: string; name: string; tagline: string; images: string[] };
  variants: V[];
};

export function BuyBox({ product, variants }: Props) {
  const { add } = useCart();
  const [vid, setVid] = useState(variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [thumb, setThumb] = useState(0);

  const v = variants.find((x) => x.id === vid);
  const gallery = Array.from(new Set([...(v?.image ? [v.image] : []), ...product.images]));
  const main = gallery[Math.min(thumb, gallery.length - 1)] ?? "/products/chips-ripe.webp";
  const out = !v || v.stock <= 0;

  function pick(id: string) {
    setVid(id);
    setThumb(0);
    setAdded(false);
  }

  function addToCart() {
    if (!v) return;
    add(
      { variantId: v.id, productSlug: product.slug, productName: product.name, variantLabel: v.label, priceKobo: v.priceKobo, image: v.image ?? product.images[0] ?? "" },
      qty,
    );
    setAdded(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-shelf">
          <Image key={main} src={main} alt={`${product.name}${v ? `, ${v.label}` : ""}`} fill priority sizes="(min-width:1024px) 600px, 95vw" className="object-contain p-10" />
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-3">
            {gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setThumb(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === thumb}
                className={`relative h-20 w-16 overflow-hidden rounded-md bg-shelf ring-2 ring-offset-2 ring-offset-paper ${i === thumb ? "ring-leaf" : "ring-transparent hover:ring-line"}`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:pt-4">
        <h1 className="display text-5xl sm:text-6xl">{product.name}</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-mute">{product.tagline}</p>
        <p className="mt-6 text-3xl font-semibold tabular-nums">{v ? formatNaira(v.priceKobo) : "—"}</p>

        {variants.length > 1 && (
          <fieldset className="mt-8">
            <legend className="label">Choose one</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {variants.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => pick(x.id)}
                  aria-pressed={x.id === vid}
                  className={`flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-[15px] transition-colors ${
                    x.id === vid ? "border-leaf bg-leaf/[.06] ring-1 ring-leaf" : "border-line bg-card hover:border-ink/40"
                  } ${x.stock <= 0 ? "opacity-50" : ""}`}
                >
                  <span className="font-medium">{x.label}</span>
                  <span className="shrink-0 tabular-nums text-mute">{x.stock <= 0 ? "Sold out" : formatNaira(x.priceKobo)}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex gap-3">
          <div className="flex h-12 items-center rounded-md border border-line bg-card">
            <button className="h-12 w-11 text-xl" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
            <button className="h-12 w-11 text-xl" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
          </div>
          <button className="btn-leaf h-12 flex-1 sm:max-w-xs" disabled={out} onClick={addToCart}>
            {out ? "Sold out" : "Add to cart"}
          </button>
        </div>
        <p className="mt-3 min-h-6 text-[15px]" role="status">
          {added && (
            <>
              Added to cart. <Link href="/cart" className="link text-leaf">View cart</Link>
            </>
          )}
        </p>

        <ul className="mt-6 divide-y divide-line border-y border-line text-[15px]">
          <li className="flex justify-between gap-4 py-3"><span className="text-mute">Payment</span><span>On delivery or by transfer</span></li>
          <li className="flex justify-between gap-4 py-3"><span className="text-mute">Delivery</span><span>Fee confirmed after you order</span></li>
          <li className="flex justify-between gap-4 py-3"><span className="text-mute">Pickup</span><span>Ile-Ife or Osogbo</span></li>
        </ul>
      </div>
    </div>
  );
}
