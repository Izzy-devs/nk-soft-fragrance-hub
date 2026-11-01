"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <form action={action} className="mt-8 space-y-4">
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="field !bg-white/10 !border-white/20 text-ivory" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field !bg-white/10 !border-white/20 text-ivory" /></div>
      {state.error && <p role="alert" className="text-red-300">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-gold w-full">{pending ? "Signing in" : "Sign in"}</button>
    </form>
  );
}
