"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/site/logo";
import { logout } from "@/lib/actions/admin";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
];

export function Sidebar({ email }: { email: string }) {
  const path = usePathname();
  const active = (h: string) => (h === "/dashboard" ? path === h : path.startsWith(h));
  return (
    <aside className="flex flex-col bg-canopy text-white lg:sticky lg:top-0 lg:h-svh">
      <div className="flex items-center gap-3 px-6 py-6">
        <Mark className="h-9 w-9 text-sprout" />
        <span className="font-display text-2xl font-extrabold tracking-wide">ABIEST</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0" aria-label="Dashboard">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-[15px] font-medium ${active(n.href) ? "bg-white/12 text-white" : "text-white/70 hover:text-white"}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 px-6 py-5 text-sm lg:block">
        <p className="truncate text-white/60">{email}</p>
        <div className="mt-3 flex gap-4">
          <Link href="/" className="text-white/80 hover:text-white">View site</Link>
          <form action={logout}><button className="text-white/80 hover:text-white">Sign out</button></form>
        </div>
      </div>
    </aside>
  );
}
