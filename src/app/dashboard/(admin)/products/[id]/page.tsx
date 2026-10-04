import { notFound } from "next/navigation";
import { connectDB, isValidObjectId, ProductModel, toProduct } from "@/lib/db";
import { koboToNaira } from "@/lib/money";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const doc = await ProductModel.findById(id).lean();
  if (!doc) notFound();
  const p = toProduct(doc);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-5xl font-black">Edit {p.name}</h1>
      <ProductForm
        product={{
          id: p.id, name: p.name, slug: p.slug, category: p.category, tagline: p.tagline, description: p.description,
          ingredients: p.ingredients ?? "", usage: p.usage ?? "", highlights: p.highlights.join("\n"), images: p.images,
          featured: p.featured, active: p.active, sortOrder: p.sortOrder,
          variants: p.variants.map((v) => ({ id: v.id, label: v.label, price: koboToNaira(v.priceKobo), stock: v.stock, image: v.image })),
        }}
      />
    </div>
  );
}
