"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteProduct, toggleProductActive } from "@/lib/actions/admin";

export function ProductRowActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-end gap-4 text-sm font-semibold">
      <Link href={`/dashboard/products/${id}`} className="text-leaf">Edit</Link>
      <button disabled={pending} onClick={() => start(() => toggleProductActive(id))} className="text-mute hover:text-ink">
        {active ? "Hide" : "Show"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete “${name}”? This removes it from the shop and can’t be undone. Past orders keep their details.`)) start(() => deleteProduct(id));
        }}
        className="text-dodo"
      >
        Delete
      </button>
    </div>
  );
}
