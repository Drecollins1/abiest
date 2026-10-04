"use client";

import { useTransition } from "react";
import type { InquiryStatus } from "@/lib/db";
import { setInquiryStatus } from "@/lib/actions/admin";

export function InquiryToggle({ id, status }: { id: string; status: InquiryStatus }) {
  const [pending, start] = useTransition();
  const next: InquiryStatus = status === "NEW" ? "HANDLED" : "NEW";
  return (
    <button disabled={pending} onClick={() => start(() => setInquiryStatus(id, next))} className="text-sm font-semibold text-leaf">
      {status === "NEW" ? "Mark handled" : "Reopen"}
    </button>
  );
}
