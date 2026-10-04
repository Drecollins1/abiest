import { ProductForm } from "@/components/dashboard/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-5xl font-black">Add product</h1>
      <ProductForm />
    </div>
  );
}
