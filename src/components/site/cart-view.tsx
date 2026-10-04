"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart";
import { formatNaira } from "@/lib/money";

export function CartView() {
  const { lines, subtotalKobo, setQty, remove, ready } = useCart();

  if (!ready) return <div className="mt-10 h-40 animate-pulse rounded-lg bg-shelf" />;

  if (!lines.length)
    return (
      <div className="mt-10 rounded-lg border border-line bg-card p-8">
        <p className="text-xl font-semibold">Your cart is empty.</p>
        <p className="mt-2 text-mute">Add something from the shop and it will show up here.</p>
        <Link href="/shop" className="btn-leaf mt-6">Go to the shop</Link>
      </div>
    );

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-line border-y border-line">
        {lines.map((l) => (
          <li key={l.variantId} className="flex gap-5 py-6">
            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-shelf">
              {l.image && <Image src={l.image} alt="" fill sizes="96px" className="object-contain p-2" />}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <Link href={`/shop/${l.productSlug}`} className="font-display text-2xl font-bold leading-none hover:text-leaf">{l.productName}</Link>
                <p className="text-[15px] text-mute">{l.variantLabel}</p>
                <p className="mt-1 font-semibold tabular-nums">{formatNaira(l.priceKobo)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-11 items-center rounded-md border border-line bg-card">
                  <button className="h-11 w-11 text-lg" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label={`Decrease ${l.productName}`}>−</button>
                  <span className="w-7 text-center font-semibold">{l.quantity}</span>
                  <button className="h-11 w-11 text-lg" onClick={() => setQty(l.variantId, l.quantity + 1)} aria-label={`Increase ${l.productName}`}>+</button>
                </div>
                <button onClick={() => remove(l.variantId)} className="text-sm font-medium text-mute underline underline-offset-4 hover:text-dodo">Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg border border-line bg-card p-6">
        <div className="flex justify-between text-lg">
          <span>Subtotal</span>
          <span className="font-semibold tabular-nums">{formatNaira(subtotalKobo)}</span>
        </div>
        <p className="mt-2 text-sm text-mute">Delivery is confirmed with you after you order, based on where you are.</p>
        <Link href="/checkout" className="btn-leaf mt-6 w-full">Checkout</Link>
        <Link href="/shop" className="mt-3 block text-center text-sm font-medium text-mute hover:text-ink">Keep shopping</Link>
      </aside>
    </div>
  );
}
