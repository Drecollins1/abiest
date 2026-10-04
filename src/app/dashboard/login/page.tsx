import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/login-form";
import { LogoCompact } from "@/components/site/logo";

export const metadata: Metadata = { title: "Dashboard sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="grid min-h-svh place-items-center bg-canopy px-5">
      <div className="w-full max-w-sm">
        <LogoCompact className="mx-auto h-16 w-auto text-sprout" />
        <div className="mt-8 rounded-3xl bg-white p-8">
          <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-mute">Sign in to manage products and orders.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
