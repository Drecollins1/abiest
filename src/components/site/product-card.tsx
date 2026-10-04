import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import { priceRange, type ProductWithVariants } from "@/lib/catalog";

export function ProductCard({ product, priority = false }: { product: ProductWithVariants; priority?: boolean }) {
  const range = priceRange(product);
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-shelf sm:aspect-[4/5]">
        <Image
          src={product.images[0] ?? "/products/chips-ripe.webp"}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 370px, (min-width: 640px) 45vw, 92vw"
          className="object-contain p-8 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <h3 className="font-display text-[26px] font-bold leading-none group-hover:text-leaf">{product.name}</h3>
        {range && (
          <p className="shrink-0 font-semibold tabular-nums">
            {range.min === range.max ? formatNaira(range.min) : <><span className="font-normal text-mute">from </span>{formatNaira(range.min)}</>}
          </p>
        )}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">{product.tagline}</p>
      {product.variants.length > 1 && (
        <p className="mt-2 text-sm text-ink/80">{product.variants.map((v) => v.label).join(" · ")}</p>
      )}
    </Link>
  );
}
