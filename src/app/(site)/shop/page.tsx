import Link from "next/link";
import type { Metadata } from "next";
import type { Category } from "@/lib/db";
import { listProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/product-card";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 60;

const TABS: { key: string; label: string; cat?: Category }[] = [
  { key: "all", label: "Everything" },
  { key: "chips", label: "Plantain chips", cat: "CHIPS" },
  { key: "flour", label: "Plantain flour", cat: "FLOUR" },
  { key: "beans", label: "Honey beans", cat: "BEANS" },
];

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c = "all" } = await searchParams;
  const tab = TABS.find((t) => t.key === c) ?? TABS[0];
  const products = await listProducts(tab.cat);

  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display text-5xl sm:text-6xl">Shop</h1>
      <p className="mt-4 max-w-lg text-lg text-mute">
        Order for your home here. Buying for an event or a store? <Link href="/services#quote" className="link text-ink">Ask for a bulk quote</Link>.
      </p>

      <nav className="mt-10 flex gap-6 overflow-x-auto border-b border-line" aria-label="Filter by product">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/shop" : `/shop?c=${t.key}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-[15px] font-medium ${
              t.key === tab.key ? "border-leaf text-ink" : "border-transparent text-mute hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {products.length ? (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-line bg-card p-8">
          <p className="text-xl font-semibold">Nothing here yet.</p>
          <p className="mt-2 text-mute">These products are being restocked. Message us on WhatsApp and we’ll tell you when they’re back.</p>
        </div>
      )}
    </div>
  );
}
