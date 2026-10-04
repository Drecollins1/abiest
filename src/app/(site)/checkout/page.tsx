import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <h1 className="display text-5xl sm:text-6xl">Checkout</h1>
      <p className="mt-4 max-w-xl text-lg text-mute">
        Place your order and we’ll call or WhatsApp you to confirm delivery and payment.
      </p>
      <CheckoutForm />
    </div>
  );
}
