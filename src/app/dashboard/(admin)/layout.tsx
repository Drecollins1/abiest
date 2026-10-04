import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-svh bg-mist lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar email={session.email} />
      <div className="min-w-0 px-5 py-8 sm:px-10">{children}</div>
    </div>
  );
}
