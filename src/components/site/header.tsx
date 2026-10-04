"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoCompact } from "./logo";
import { useCart } from "./cart";
import { site } from "@/lib/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Bulk & events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="bg-canopy text-[13px] text-white/80">
        <div className="container-x flex h-9 items-center justify-between gap-4">
          <p className="truncate">Pay on delivery or transfer · Pickup in Ile-Ife and Osogbo</p>
          <a href={site.phoneHref} className="hidden shrink-0 hover:text-white sm:block">Call {site.phone}</a>
        </div>
      </div>

      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-leaf" aria-label="ABIEST home">
          <LogoCompact className="h-10 w-auto" />
        </Link>

        <nav className="hidden h-full items-stretch gap-7 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className={`flex items-center border-b-2 pt-0.5 text-[15px] font-medium transition-colors ${
                active(n.href) ? "border-leaf text-ink" : "border-transparent text-mute hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/cart" className="flex h-10 items-center gap-2 rounded-md px-3 font-semibold hover:bg-shelf" aria-label={`Cart, ${ready ? count : 0} items`}>
            <BagIcon />
            <span>Cart</span>
            <span className="tabular-nums text-mute">({ready ? count : 0})</span>
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-shelf md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line md:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
                className={`border-b border-line py-3.5 text-lg font-medium last:border-0 ${active(n.href) ? "text-leaf" : "text-ink"}`}>
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 8h14l-1.2 12.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
