const STYLES: Record<string, string> = {
  PENDING: "bg-gold/25 text-[#7a5300]",
  CONFIRMED: "bg-leaf/12 text-leaf",
  DELIVERED: "bg-ink/8 text-ink",
  CANCELLED: "bg-dodo/12 text-dodo",
  NEW: "bg-gold/25 text-[#7a5300]",
  HANDLED: "bg-ink/8 text-mute",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status] ?? ""}`}>
      {status.toLowerCase()}
    </span>
  );
}
