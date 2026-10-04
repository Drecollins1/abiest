import Image from "next/image";
import Link from "next/link";
import { listProducts, priceRange, CATEGORY_LABEL, type ProductWithVariants } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";
import { site, whatsappLink } from "@/lib/site";
import { ProductCard } from "@/components/site/product-card";
import { FoodLabel } from "@/components/site/food-label";

export const dynamic = "force-dynamic"; // always fresh; also lets the app build without a database

const OCCASIONS = [
  "Weddings", "Birthdays", "Naming ceremonies", "Burials", "Church programmes",
  "Supermarkets", "Distributors", "Offices", "Schools", "Hostels",
];

const STEPS = [
  ["Tell us what you need", "Products, how many and when. A rough number is fine to start."],
  ["Get a quote", "We reply with pricing, pack options and a production date."],
  ["We produce and deliver", "Packed and delivered, or ready for pickup in Ile-Ife or Osogbo."],
];

export default async function HomePage() {
  const products = await listProducts();
  const byCat = (c: ProductWithVariants["category"]) => products.find((p) => p.category === c);
  const shelf = [byCat("FLOUR"), byCat("CHIPS"), byCat("BEANS")].filter((p): p is ProductWithVariants => !!p);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="container-x grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:py-20">
        <div>
          <h1 className="display text-[clamp(44px,6.2vw,78px)]">
            Plantain chips, plantain flour and honey beans from Ile‑Ife.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
            Processed and packed at our centre in Osun State. Short ingredient lists, sealed packs, and delivery or pickup across the state.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/shop" className="btn-leaf px-7">Shop now</Link>
            <Link href="/services" className="link text-[15px]">Bulk & event orders</Link>
          </div>
          <p className="mt-10 text-sm text-mute">NAFDAC Reg. No. {site.nafdac}</p>
        </div>

        {/* The range on a shelf, with shelf-edge price tags */}
        {shelf.length > 0 && (
          <div className="rounded-lg bg-shelf px-4 pt-10 sm:px-8 sm:pt-16">
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
              {shelf.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group block">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={1200}
                    height={1500}
                    priority
                    sizes="(min-width:1024px) 200px, 30vw"
                    className={`mx-auto w-full origin-bottom transition-transform duration-300 group-hover:-translate-y-1.5 ${p.category === "CHIPS" ? "scale-[1.45]" : "scale-[1.3]"}`}
                  />
                </Link>
              ))}
            </div>
            <div className="-mx-4 sm:-mx-8" aria-hidden>
              <div className="h-3 bg-[#b8996a]" />
              <div className="h-1.5 bg-[#8c6e45]" />
            </div>
            <div className="grid grid-cols-3 gap-3 py-4 sm:gap-6 sm:py-5">
              {shelf.map((p) => {
                const r = priceRange(p);
                return (
                  <Link key={p.id} href={`/shop/${p.slug}`} className="block border-l-4 border-leaf bg-card px-2.5 py-2 hover:bg-white sm:px-3">
                    <span className="block text-[12px] leading-tight text-mute sm:text-[13px]">{CATEGORY_LABEL[p.category]}</span>
                    {r && <span className="mt-0.5 block font-semibold tabular-nums sm:text-lg">{formatNaira(r.min)}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ---------- The range ---------- */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-x">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="display text-4xl sm:text-5xl">The range</h2>
            <Link href="/shop" className="link text-[15px]">All products</Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Ingredients ---------- */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_2.4fr] lg:gap-14">
          <div>
            <h2 className="display text-4xl sm:text-5xl">What goes into each pack</h2>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-mute">
              The same list that’s printed on the back of the pack. No additives and no preservatives.
            </p>
          </div>
          <div className="grid items-start gap-5 sm:grid-cols-3">
            {shelf.filter((p) => p.ingredients).map((p) => (
              <FoodLabel key={p.id} name={p.name} ingredients={p.ingredients!} highlights={p.highlights} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Bulk & events ---------- */}
      <section className="bg-canopy text-white">
        <div className="container-x grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Ordering for an event or a shop?</h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              We produce in volume: souvenir packs of chips for parties, and regular supply of chips, flour and beans for stores and organisations.
            </p>
            <ul className="mt-8 grid grid-cols-2 border-t border-white/15 text-[15px] text-white/85">
              {OCCASIONS.map((o) => (
                <li key={o} className="border-b border-white/15 py-2.5 odd:pr-4">{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <ol className="space-y-6">
              {STEPS.map(([t, b], i) => (
                <li key={t} className="grid grid-cols-[2.25rem_1fr] gap-x-3">
                  <span className="font-display text-3xl font-extrabold leading-none text-gold">{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{t}</h3>
                    <p className="mt-1 text-white/70">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/services#quote" className="btn-gold px-7">Request a quote</Link>
              <a href={whatsappLink("Hello ABIEST, I'd like a quote for a bulk order.")} className="text-[15px] font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">
                Or ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
