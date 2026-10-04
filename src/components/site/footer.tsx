import Link from "next/link";
import { Logo } from "./logo";
import { site, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-canopy-900 text-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo className="h-20 w-auto text-sprout" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/65">
            Processed and packaged by {site.name}, Osun State.
          </p>
          <p className="mt-3 text-sm text-white/65">NAFDAC Reg. No. {site.nafdac}</p>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-white/50">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            <li><Link className="hover:text-white" href="/shop?c=chips">Plantain chips</Link></li>
            <li><Link className="hover:text-white" href="/shop?c=flour">Plantain flour</Link></li>
            <li><Link className="hover:text-white" href="/shop?c=beans">Honey beans</Link></li>
            <li><Link className="hover:text-white" href="/services">Bulk & event orders</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-white/50">Talk to us</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-white/75">
            <li><a className="hover:text-white" href={site.phoneHref}>{site.phone}</a></li>
            <li><a className="hover:text-white" href={whatsappLink("Hello ABIEST, I'd like to place an order.")}>WhatsApp us</a></li>
            <li><a className="hover:text-white break-all" href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          {site.locations.map((l) => (
            <address key={l.label} className="not-italic">
              <h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-white/50">{l.label}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                {l.lines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
            </address>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p>Store in a cool, dry place.</p>
        </div>
      </div>
    </footer>
  );
}
