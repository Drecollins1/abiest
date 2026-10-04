import Link from "next/link";
import type { OrderStatus } from "@/lib/db";
import { connectDB, OrderModel, toOrder } from "@/lib/db";
import { formatNaira } from "@/lib/money";
import { OrderStatusSelect } from "@/components/dashboard/order-status-select";
import { whatsappTo } from "@/lib/site";

const FILTERS: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "ALL" } = await searchParams;
  const filter = FILTERS.includes(status as OrderStatus) ? (status as OrderStatus | "ALL") : "ALL";
  await connectDB();
  const orders = (await OrderModel.find(filter === "ALL" ? {} : { status: filter }).sort({ createdAt: -1 }).limit(100).lean()).map(toOrder);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-5xl font-black">Orders</h1>
      <nav className="mt-6 flex gap-2 overflow-x-auto" aria-label="Filter orders">
        {FILTERS.map((f) => (
          <Link key={f} href={f === "ALL" ? "/dashboard/orders" : `/dashboard/orders?status=${f}`} aria-current={f === filter ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold capitalize ${f === filter ? "bg-ink text-white" : "bg-white text-mute hover:text-ink"}`}>
            {f.toLowerCase()}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-4">
        {orders.length === 0 && <p className="rounded-2xl bg-white p-8 text-mute">No orders here.</p>}
        {orders.map((o) => (
          <article key={o.id} className="rounded-2xl bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-extrabold">{o.customerName}</p>
                <p className="text-sm text-mute">{o.reference} · {o.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{formatNaira(o.subtotalKobo)}</span>
                <OrderStatusSelect id={o.id} status={o.status} />
              </div>
            </div>
            <div className="mt-4 grid gap-6 text-[15px] md:grid-cols-3">
              <ul className="space-y-1 md:col-span-2">
                {o.items.map((i) => (
                  <li key={i.id}>{i.quantity} × {i.productName} <span className="text-mute">({i.variantLabel})</span> — {formatNaira(i.unitPriceKobo * i.quantity)}</li>
                ))}
                {o.note && <li className="pt-2 text-mute">Note: {o.note}</li>}
              </ul>
              <div className="space-y-1">
                <p className="font-semibold">{o.fulfilment === "DELIVERY" ? "Delivery" : "Pickup"}</p>
                {o.fulfilment === "DELIVERY" && <p className="text-mute">{[o.address, o.city, o.state].filter(Boolean).join(", ")}</p>}
                <p><a className="text-leaf" href={`tel:${o.phone}`}>{o.phone}</a></p>
                <p><a className="text-leaf" target="_blank" rel="noreferrer"
                  href={whatsappTo(o.phone, `Hello ${o.customerName.split(" ")[0]}, this is ABIEST about your order ${o.reference}.`)}>
                  WhatsApp customer
                </a></p>
                {o.email && <p className="text-mute">{o.email}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
