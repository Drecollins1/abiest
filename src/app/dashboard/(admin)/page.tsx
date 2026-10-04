import Link from "next/link";
import { connectDB, ProductModel, OrderModel, InquiryModel, toOrder } from "@/lib/db";
import { formatNaira } from "@/lib/money";
import { StatusPill } from "@/components/dashboard/status-pill";

type LowStock = { id: string; label: string; stock: number; product: { id: string; name: string } };

export default async function Overview() {
  await connectDB();
  const [products, lowStockRaw, pending, newInquiries, recentRaw, revenueRaw] = await Promise.all([
    ProductModel.countDocuments({ active: true }),
    ProductModel.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lte: 10 } } },
      { $sort: { "variants.stock": 1 } },
      { $limit: 6 },
      { $project: { _id: 0, id: { $toString: "$variants._id" }, label: "$variants.label", stock: "$variants.stock", product: { id: { $toString: "$_id" }, name: "$name" } } },
    ]),
    OrderModel.countDocuments({ status: "PENDING" }),
    InquiryModel.countDocuments({ status: "NEW" }),
    OrderModel.find().sort({ createdAt: -1 }).limit(6).lean(),
    OrderModel.aggregate([
      { $match: { status: { $in: ["CONFIRMED", "DELIVERED"] } } },
      { $group: { _id: null, total: { $sum: "$subtotalKobo" } } },
    ]),
  ]);
  const lowStock = lowStockRaw as LowStock[];
  const recent = recentRaw.map(toOrder);
  const revenue = { _sum: { subtotalKobo: (revenueRaw[0]?.total as number | undefined) ?? 0 } };

  const stats = [
    { label: "Orders to confirm", value: pending, href: "/dashboard/orders?status=PENDING" },
    { label: "New inquiries", value: newInquiries, href: "/dashboard/inquiries" },
    { label: "Products live", value: products, href: "/dashboard/products" },
    { label: "Confirmed sales", value: formatNaira(revenue._sum.subtotalKobo ?? 0), href: "/dashboard/orders" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-5xl font-black">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl bg-white p-6 hover:ring-2 hover:ring-leaf/20">
            <p className="text-sm text-mute">{s.label}</p>
            <p className="mt-2 font-display text-4xl font-black">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold">Latest orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-leaf">All orders</Link>
          </div>
          {recent.length ? (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3 text-[15px]">
                  <div>
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-sm text-mute">{o.reference} · {o.createdAt.toLocaleDateString("en-NG")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatNaira(o.subtotalKobo)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-mute">No orders yet. They’ll show up here as soon as someone checks out.</p>}
        </section>

        <section className="rounded-2xl bg-white p-6">
          <h2 className="font-display text-2xl font-extrabold">Running low</h2>
          {lowStock.length ? (
            <ul className="mt-4 space-y-3 text-[15px]">
              {lowStock.map((v) => (
                <li key={v.id} className="flex justify-between gap-3">
                  <Link href={`/dashboard/products/${v.product.id}`} className="hover:text-leaf">{v.product.name} <span className="text-mute">({v.label})</span></Link>
                  <span className={`font-semibold ${v.stock === 0 ? "text-dodo" : ""}`}>{v.stock} left</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-mute">Every option has more than 10 in stock.</p>}
        </section>
      </div>
    </div>
  );
}
