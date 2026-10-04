import { connectDB, ProductModel, toProduct, type Category, type Product } from "./db";

export type ProductWithVariants = Product;

export const CATEGORY_LABEL: Record<Category, string> = {
  CHIPS: "Plantain chips",
  FLOUR: "Plantain flour",
  BEANS: "Honey beans",
};

export async function listProducts(category?: Category) {
  await connectDB();
  const docs = await ProductModel.find({ active: true, ...(category ? { category } : {}) })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return docs.map(toProduct);
}

export async function getProduct(slug: string) {
  await connectDB();
  const doc = await ProductModel.findOne({ slug, active: true }).lean();
  return doc ? toProduct(doc) : null;
}

export function priceRange(p: ProductWithVariants) {
  const prices = p.variants.map((v) => v.priceKobo);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
