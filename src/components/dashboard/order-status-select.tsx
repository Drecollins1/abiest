"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/lib/db";
import { setOrderStatus } from "@/lib/actions/admin";

const OPTIONS: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export function OrderStatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Order status"
      disabled={pending}
      defaultValue={status}
      onChange={(e) => start(() => setOrderStatus(id, e.target.value as OrderStatus))}
      className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold capitalize"
    >
      {OPTIONS.map((o) => <option key={o} value={o}>{o.toLowerCase()}</option>)}
    </select>
  );
}
