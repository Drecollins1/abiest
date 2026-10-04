"use client";

import { useActionState, useState } from "react";
import { submitInquiry, type InquiryState } from "@/lib/actions/inquiries";

type Mode = "quote" | "contact";

export function InquiryForm({ mode }: { mode: Mode }) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const [type, setType] = useState<"EVENT" | "BULK">("EVENT");

  if (state?.ok)
    return (
      <div className="border-l-4 border-leaf py-2 pl-5" role="status">
        <p className="display text-3xl">Message received.</p>
        <p className="mt-2 text-mute">We’ll get back to you within one working day, usually sooner on WhatsApp.</p>
      </div>
    );

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="type" value={mode === "contact" ? "CONTACT" : type} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {mode === "quote" && (
        <fieldset className="sm:col-span-2">
          <legend className="label">What’s it for?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              ["EVENT", "A party or event"],
              ["BULK", "A store or organisation"],
            ] as const).map(([v, l]) => (
              <label key={v} className={`cursor-pointer rounded-md border px-4 py-3 font-medium ${type === v ? "border-leaf bg-leaf/[.06] ring-1 ring-leaf" : "border-line bg-card hover:border-ink/40"}`}>
                <input type="radio" className="sr-only" checked={type === v} onChange={() => setType(v)} />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label className="label" htmlFor="q-name">Your name</label>
        <input id="q-name" name="name" className="field" autoComplete="name" required />
      </div>
      <div>
        <label className="label" htmlFor="q-phone">Phone</label>
        <input id="q-phone" name="phone" type="tel" className="field" autoComplete="tel" required />
      </div>
      <div className={mode === "quote" ? "" : "sm:col-span-2"}>
        <label className="label" htmlFor="q-email">Email <span className="font-normal text-mute">(optional)</span></label>
        <input id="q-email" name="email" type="email" className="field" autoComplete="email" />
      </div>

      {mode === "quote" && (
        <>
          {type === "BULK" ? (
            <div>
              <label className="label" htmlFor="q-org">Business or organisation</label>
              <input id="q-org" name="organization" className="field" autoComplete="organization" />
            </div>
          ) : (
            <div>
              <label className="label" htmlFor="q-date">Event date</label>
              <input id="q-date" name="eventDate" type="date" className="field" />
            </div>
          )}
          <fieldset className="sm:col-span-2">
            <legend className="label">Products</legend>
            <div className="flex flex-wrap gap-2">
              {["Ripe plantain chips", "Unripe plantain chips", "Plantain flour", "Honey beans"].map((p) => (
                <label key={p} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line bg-card px-3.5 py-2.5 text-[15px] has-[:checked]:border-leaf has-[:checked]:ring-1 has-[:checked]:ring-leaf">
                  <input type="checkbox" name="products" value={p} className="h-4 w-4 accent-[var(--color-leaf)]" />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="q-qty">Roughly how many?</label>
            <input id="q-qty" name="quantity" className="field" placeholder={type === "EVENT" ? "e.g. 300 souvenir packs" : "e.g. 20 cartons a month"} />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label className="label" htmlFor="q-msg">{mode === "quote" ? "Anything else?" : "Message"}</label>
        <textarea id="q-msg" name="message" rows={4} className="field" required
          placeholder={mode === "quote" ? "Delivery location, pack sizes, deadline…" : ""} />
      </div>

      {state?.error && <p className="rounded-md bg-dodo/10 p-3 text-sm font-medium text-dodo sm:col-span-2" role="alert">{state.error}</p>}
      <div className="sm:col-span-2">
        <button className="btn-leaf px-8" disabled={pending}>{pending ? "Sending…" : mode === "quote" ? "Request a quote" : "Send message"}</button>
      </div>
    </form>
  );
}
