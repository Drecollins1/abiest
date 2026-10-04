"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/admin";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="field" autoComplete="username" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="field" autoComplete="current-password" required />
      </div>
      {state?.error && <p className="text-sm font-medium text-dodo" role="alert">{state.error}</p>}
      <button className="btn-leaf w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
