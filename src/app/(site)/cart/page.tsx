import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display text-5xl sm:text-6xl">Your cart</h1>
      <CartView />
    </div>
  );
}
