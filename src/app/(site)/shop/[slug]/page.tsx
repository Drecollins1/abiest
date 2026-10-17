import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProduct, listProducts } from "@/lib/catalog";
import { BuyBox } from "@/components/site/buy-box";
import { ProductCard } from "@/components/site/product-card";
import { FoodLabel } from "@/components/site/food-label";
import { site } from "@/lib/site";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.tagline, openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const others = (await listProducts()).filter((p) => p.id !== product.id).slice(0, 3);
  const steps = product.usage?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];

  return (
    <>
      <div className="container-x py-8 sm:py-10">
        <nav className="mb-6 text-sm text-mute" aria-label="Breadcrumb">
          <Link href="/shop" className="hover:text-ink">Shop</Link> <span aria-hidden>/</span> <span className="text-ink">{product.name}</span>
        </nav>
        <BuyBox
          product={{ slug: product.slug, name: product.name, tagline: product.tagline, images: product.images }}
          variants={product.variants.map((v) => ({ id: v.id, label: v.label, priceKobo: v.priceKobo, stock: v.stock, image: v.image }))}
        />
      </div>

      <section className="border-t border-line">
        <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="space-y-10">
            <div>
              <h2 className="display text-3xl sm:text-4xl">About it</h2>
              <p className="mt-4 max-w-prose whitespace-pre-line text-[17px] leading-relaxed text-ink/85">{product.description}</p>
            </div>
            {steps.length > 0 && (
              <div>
                <h2 className="display text-3xl sm:text-4xl">How to use</h2>
                {steps.length > 1 ? (
                  <ol className="mt-4 max-w-prose divide-y divide-line border-y border-line">
                    {steps.map((s, i) => (
                      <li key={i} className="grid grid-cols-[2rem_1fr] py-3 text-[17px] leading-relaxed">
                        <span className="font-semibold tabular-nums text-leaf">{i + 1}.</span>
                        <span className="text-ink/85">{s}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-ink/85">{steps[0]}</p>
                )}
              </div>
            )}
          </div>
          {product.ingredients && (
            <FoodLabel
              className="h-fit lg:sticky lg:top-24"
              name={product.name}
              ingredients={product.ingredients}
              highlights={product.highlights}
              footnote={`NAFDAC Reg. No. ${site.nafdac}. Store in a cool, dry place.`}
            />
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="border-t border-line py-14">
          <div className="container-x">
            <h2 className="display text-3xl sm:text-4xl">Also in the range</h2>
            <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
