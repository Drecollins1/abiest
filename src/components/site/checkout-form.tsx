"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useCart } from "./cart";
import { formatNaira } from "@/lib/money";
import { placeOrder } from "@/lib/actions/orders";

export function CheckoutForm() {
  const { lines, subtotalKobo, clear, ready } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (ready && !lines.length)
    return (
      <div className="mt-10 rounded-lg border border-line bg-card p-8">
        <p className="text-xl font-semibold">There’s nothing to check out.</p>
        <Link href="/shop" className="btn-leaf mt-6">Go to the shop</Link>
      </div>
    );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "");
    setError(null);
    start(async () => {
      const res = await placeOrder({
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        customerName: s("name"),
        phone: s("phone"),
        email: s("email"),
        fulfilment: "DELIVERY", // delivery only; no pickup points
        address: s("address"),
        city: s("city"),
        state: s("state"),
        note: s("note"),
      });
      if (!res.ok) return setError(res.error);
      clear();
      router.push(`/checkout/success?ref=${res.reference}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="display mb-4 text-3xl">Your details</legend>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" className="field" autoComplete="name" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone (WhatsApp if possible)</label>
            <input id="phone" name="phone" className="field" type="tel" autoComplete="tel" placeholder="0803 000 0000" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email <span className="font-normal text-mute">(optional)</span></label>
            <input id="email" name="email" className="field" type="email" autoComplete="email" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="display mb-1 text-3xl">Delivery address</legend>
          <p className="mb-5 text-sm text-mute">We confirm the delivery fee with you before you pay.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">Street address</label>
              <input id="address" name="address" className="field" autoComplete="street-address" required />
            </div>
            <div>
              <label className="label" htmlFor="city">City / town</label>
              <input id="city" name="city" className="field" autoComplete="address-level2" required />
            </div>
            <div>
              <label className="label" htmlFor="state">State / region</label>
              <input id="state" name="state" className="field" autoComplete="address-level1" />
            </div>
          </div>
          <div className="mt-5">
            <label className="label" htmlFor="note">Anything we should know? <span className="font-normal text-mute">(optional)</span></label>
            <textarea id="note" name="note" rows={3} className="field" />
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-lg border border-line bg-card p-6 lg:sticky lg:top-32">
        <h2 className="display text-2xl">Order summary</h2>
        <ul className="mt-4 space-y-3 text-[15px]">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-4">
              <span>
                {l.quantity} × {l.productName} <span className="text-mute">({l.variantLabel})</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">{formatNaira(l.priceKobo * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-5 text-lg">
          <span>Subtotal</span>
          <span className="font-semibold tabular-nums">{formatNaira(subtotalKobo)}</span>
        </div>
        {error && <p className="mt-4 rounded-md bg-dodo/10 p-3 text-sm font-medium text-dodo" role="alert">{error}</p>}
        <button className="btn-leaf mt-6 w-full" disabled={pending || !ready}>{pending ? "Placing order…" : "Place order"}</button>
        <p className="mt-3 text-center text-xs text-mute">Pay on delivery or by bank transfer once we confirm.</p>
      </aside>
    </form>
  );
}
