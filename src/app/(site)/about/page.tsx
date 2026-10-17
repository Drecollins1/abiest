import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

// Copy below is a starting point. Replace it with the founders' own story.
export default function AboutPage() {
  return (
    <>
      <section className="container-x grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <h1 className="display text-5xl sm:text-6xl">About ABIEST</h1>
          <div className="mt-6 max-w-xl space-y-5 text-lg leading-relaxed text-ink/85">
            <p>
              ABIEST Foodmart Ventures processes and packages plantain and grain staples in Osun State. The range is short on purpose: crispy ripe and unripe plantain chips, unripe plantain flour and honey beans.
            </p>
            <p>
              Everything is made at our processing centre at the Technology Incubation Centre in Ile-Ife, and every product carries our NAFDAC registration ({site.nafdac}).
            </p>
          </div>
        </div>
        <div className="relative aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-lg bg-shelf lg:justify-self-end">
          <Image src="/products/chips-unripe-jar.webp" alt="ABI&EST unripe plantain chips" fill sizes="420px" className="object-contain p-10" />
        </div>
      </section>

      <section className="border-t border-line">
        <dl className="container-x divide-y divide-line py-6">
          {[
            ["Short labels", "Plantain, a little salt, onion and pepper for the spiced chips. Our flour is unripe plantain and nothing else."],
            ["Sealed and labelled", "Chips come in resealable gold pouches and jars. Flour and beans are sealed in clear bags so you can see exactly what you’re buying."],
            ["Clean beans", "Our honey beans are stone free and dirt free, so you can go straight from bag to pot."],
          ].map(([t, b]) => (
            <div key={t} className="grid gap-2 py-6 md:grid-cols-[1fr_2fr] md:gap-10">
              <dt className="text-xl font-semibold">{t}</dt>
              <dd className="max-w-prose text-[17px] leading-relaxed text-mute">{b}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-line">
        <div className="container-x flex flex-wrap items-center justify-between gap-6 py-12">
          <p className="text-xl">See the full range and prices.</p>
          <Link href="/shop" className="btn-leaf px-7">Go to the shop</Link>
        </div>
      </section>
    </>
  );
}
