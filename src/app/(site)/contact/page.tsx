import type { Metadata } from "next";
import { InquiryForm } from "@/components/site/inquiry-form";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-x grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
      <div>
        <h1 className="display text-5xl sm:text-6xl">Contact us</h1>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-mute">WhatsApp is the quickest way to reach us. We reply to messages and emails within one working day.</p>

        <div className="mt-8 space-y-3">
          <a href={whatsappLink("Hello ABIEST!")} className="btn-leaf w-full sm:w-auto">Chat on WhatsApp</a>
          <div className="flex flex-col gap-1 pt-3 text-lg">
            <a href={site.phoneHref} className="font-semibold hover:text-leaf">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="font-semibold hover:text-leaf">{site.email}</a>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-1">
          {site.locations.map((l) => (
            <address key={l.label} className="not-italic">
              <h2 className="text-lg font-semibold">{l.label}</h2>
              <p className="mt-2 text-[17px] leading-relaxed text-mute">
                {l.lines.map((x) => <span key={x} className="block">{x}</span>)}
              </p>
            </address>
          ))}
        </div>
      </div>
      <div className="h-fit rounded-lg border border-line bg-card p-5 sm:p-8">
        <h2 className="display mb-6 text-3xl">Send a message</h2>
        <InquiryForm mode="contact" />
      </div>
    </div>
  );
}
