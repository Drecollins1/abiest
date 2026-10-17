import Image from "next/image";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/site/inquiry-form";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Bulk & event orders",
  description: "Plantain chips, plantain flour and honey beans produced in volume for parties, events, stores and organisations.",
};

const OFFERS = [
  {
    title: "Parties & events",
    body: "Souvenir packs of plantain chips for weddings, birthdays, naming ceremonies, burials and church programmes. Ripe, unripe or a mix, packed and sealed so they travel well.",
    image: "/products/chips-ripe-pouch.webp",
    examples: ["Weddings", "Birthdays", "Naming ceremonies", "Burials", "Church programmes"],
  },
  {
    title: "Stores & organisations",
    body: "Regular supply for supermarkets, distributors, offices, schools and hostels. Chips by the carton, plantain flour and honey beans in 1kg and 2kg bags.",
    image: "/products/chips-unripe-jar.webp",
    examples: ["Supermarkets", "Distributors", "Offices", "Schools", "Hostels"],
  },
];

const STEPS = [
  ["Tell us what you need", "Products, how many and when. A rough number is fine to start."],
  ["Get a quote", "We reply with pricing, pack options and a production date."],
  ["We produce and deliver", "We produce your order, pack it and deliver it, or have it ready for pickup."],
];

export default function ServicesPage() {
  return (
    <>
      <section className="container-x py-12 sm:py-16">
        <h1 className="display max-w-3xl text-5xl sm:text-6xl">Bulk & event orders</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-mute">
          Large orders for parties, events, shops and organisations, produced at our processing centre in Ile-Ife.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="#quote" className="btn-leaf px-7">Request a quote</a>
          <a href={site.phoneHref} className="link text-[15px]">Call {site.phone}</a>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-x grid gap-12 py-14 md:grid-cols-2 md:gap-8">
          {OFFERS.map((o) => (
            <article key={o.title} className="grid grid-cols-[1fr_120px] gap-6 sm:grid-cols-[1fr_160px]">
              <div>
                <h2 className="display text-3xl sm:text-4xl">{o.title}</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-ink/85">{o.body}</p>
                <p className="mt-4 text-[15px] text-mute">{o.examples.join(" · ")}</p>
              </div>
              <div className="relative aspect-[4/5] self-start overflow-hidden rounded-lg bg-shelf">
                <Image src={o.image} alt="" aria-hidden fill sizes="160px" className="object-contain p-3" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-x py-14">
          <h2 className="display text-3xl sm:text-4xl">How it works</h2>
          <ol className="mt-8 grid border-t border-ink md:grid-cols-3">
            {STEPS.map(([t, b], i) => (
              <li key={t} className="border-b border-line py-5 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                <span className="text-sm font-semibold tabular-nums text-leaf">Step {i + 1}</span>
                <h3 className="mt-1 text-xl font-semibold">{t}</h3>
                <p className="mt-1.5 text-[16px] leading-relaxed text-mute">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quote" className="scroll-mt-28 border-t border-line">
        <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Get a quote</h2>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-mute">
              Prefer to talk? Call <a className="link text-ink" href={site.phoneHref}>{site.phone}</a> or{" "}
              <a className="link text-ink" href={whatsappLink("Hello ABIEST, I'd like a quote for a bulk order.")}>message us on WhatsApp</a>.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card p-5 sm:p-8">
            <InquiryForm mode="quote" />
          </div>
        </div>
      </section>
    </>
  );
}
