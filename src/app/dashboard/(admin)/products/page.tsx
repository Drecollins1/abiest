import Image from "next/image";
import Link from "next/link";
import { connectDB, ProductModel, toProduct } from "@/lib/db";
import { formatNaira } from "@/lib/money";
import { CATEGORY_LABEL } from "@/lib/catalog";
import { ProductRowActions } from "@/components/dashboard/product-row-actions";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await connectDB();
  const products = (await ProductModel.find().sort({ sortOrder: 1, createdAt: 1 }).lean()).map(toProduct);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl font-black">Products</h1>
        <Link href="/dashboard/products/new" className="btn-leaf">Add product</Link>
      </div>
      {saved && <p className="mt-4 rounded-xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf" role="status">Product saved. It’s live on the site.</p>}

      {products.length ? (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
          <table className="w-full min-w-[760px] text-left text-[15px]">
            <thead className="border-b border-line text-sm text-mute">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Options</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const prices = p.variants.map((v) => v.priceKobo);
                const stock = p.variants.reduce((n, v) => n + v.stock, 0);
                return (
                  <tr key={p.id} className={p.active ? "" : "opacity-60"}>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/products/${p.id}`} className="flex items-center gap-4">
                        <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-mist">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="52px" className="object-contain p-1" />}
                        </span>
                        <span>
                          <span className="block font-semibold hover:text-leaf">{p.name}</span>
                          <span className="text-sm text-mute">{CATEGORY_LABEL[p.category]}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-mute">{p.variants.map((v) => v.label).join(", ")}</td>
                    <td className="px-5 py-4">{prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatNaira(prices[0]) : `${formatNaira(Math.min(...prices))} – ${formatNaira(Math.max(...prices))}`) : "—"}</td>
                    <td className={`px-5 py-4 ${stock === 0 ? "font-semibold text-dodo" : ""}`}>{stock}</td>
                    <td className="px-5 py-4">{p.active ? "Live" : "Hidden"}{p.featured && <span className="ml-2 rounded-full bg-gold/25 px-2 py-0.5 text-xs font-semibold text-[#7a5300]">Featured</span>}</td>
                    <td className="px-5 py-4"><ProductRowActions id={p.id} name={p.name} active={p.active} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-white p-10">
          <p className="font-display text-3xl font-extrabold">No products yet.</p>
          <p className="mt-2 text-mute">Add your first product to put it in the shop.</p>
          <Link href="/dashboard/products/new" className="btn-leaf mt-6">Add product</Link>
        </div>
      )}
    </div>
  );
}
