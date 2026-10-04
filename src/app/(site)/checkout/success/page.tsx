import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB, OrderModel, toOrder } from "@/lib/db";
import { formatNaira } from "@/lib/money";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  if (!ref) notFound();
  await connectDB();
  const doc = await OrderModel.findOne({ reference: ref }).lean();
  if (!doc) notFound();
  const order = toOrder(doc);

  const message = `Hello ABIEST, I just placed order ${order.reference} (${formatNaira(order.subtotalKobo)}). Please confirm.`;

  return (
    <div className="container-x max-w-3xl py-12 sm:py-16">
      <p className="text-sm font-semibold text-leaf">Order {order.reference}</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Thank you, {order.customerName.split(" ")[0]}.</h1>
      <p className="mt-5 text-lg leading-relaxed text-mute">
        We’ve got your order. We’ll contact you on {order.phone} to confirm {order.fulfilment === "DELIVERY" ? "delivery" : "pickup"} and payment. For a faster reply, send us the order number on WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={whatsappLink(message)} className="btn-leaf" target="_blank" rel="noreferrer">Send on WhatsApp</a>
        <Link href="/shop" className="btn-outline">Back to the shop</Link>
      </div>

      <div className="mt-10 rounded-lg border border-line bg-card p-6">
        <ul className="space-y-2 text-[15px]">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span>{i.quantity} × {i.productName} <span className="text-mute">({i.variantLabel})</span></span>
              <span>{formatNaira(i.unitPriceKobo * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
          <span>Subtotal</span>
          <span>{formatNaira(order.subtotalKobo)}</span>
        </div>
      </div>
    </div>
  );
}
