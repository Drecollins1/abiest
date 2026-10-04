import { connectDB, InquiryModel, toInquiry } from "@/lib/db";
import { StatusPill } from "@/components/dashboard/status-pill";
import { InquiryToggle } from "@/components/dashboard/inquiry-toggle";

const TYPE_LABEL = { EVENT: "Event quote", BULK: "Bulk quote", CONTACT: "Message" } as const;

export default async function InquiriesPage() {
  await connectDB();
  // "NEW" sorts after "HANDLED", so descending puts new inquiries first.
  const inquiries = (await InquiryModel.find().sort({ status: -1, createdAt: -1 }).limit(100).lean()).map(toInquiry);
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-5xl font-black">Inquiries</h1>
      <p className="mt-2 text-mute">Quote requests from the Bulk & events page and messages from Contact.</p>
      <div className="mt-8 space-y-4">
        {inquiries.length === 0 && <p className="rounded-2xl bg-white p-8 text-mute">Nothing yet.</p>}
        {inquiries.map((q) => (
          <article key={q.id} className={`rounded-2xl bg-white p-6 ${q.status === "HANDLED" ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-leaf">{TYPE_LABEL[q.type]}</p>
                <p className="font-display text-2xl font-extrabold">{q.name}{q.organization && <span className="text-mute">, {q.organization}</span>}</p>
                <p className="text-sm text-mute">{q.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={q.status} />
                <InquiryToggle id={q.id} status={q.status} />
              </div>
            </div>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-[15px] sm:grid-cols-[140px_1fr]">
              <dt className="text-mute">Contact</dt>
              <dd><a className="text-leaf" href={`tel:${q.phone}`}>{q.phone}</a>{q.email && <> · <a className="text-leaf" href={`mailto:${q.email}`}>{q.email}</a></>}</dd>
              {q.eventDate && (<><dt className="text-mute">Event date</dt><dd>{q.eventDate.toLocaleDateString("en-NG", { dateStyle: "long" })}</dd></>)}
              {q.products.length > 0 && (<><dt className="text-mute">Products</dt><dd>{q.products.join(", ")}</dd></>)}
              {q.quantity && (<><dt className="text-mute">Quantity</dt><dd>{q.quantity}</dd></>)}
              <dt className="text-mute">Message</dt>
              <dd className="whitespace-pre-line">{q.message}</dd>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
