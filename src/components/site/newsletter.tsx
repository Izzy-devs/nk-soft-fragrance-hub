"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/actions/newsletter";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeAction, { ok: false, message: "" });
  return (
    <form action={action} className="mt-4">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <div className="flex gap-2">
        <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="Your email" className="field !bg-white/10 !border-white/20 text-ivory placeholder:text-ivory/50" />
        <button type="submit" disabled={pending} className="btn btn-gold px-4">{pending ? "Saving" : "Subscribe"}</button>
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <p role="status" className={`mt-2 text-sm ${state.ok ? "text-gold" : "text-red-300"}`}>{state.message}</p>
    </form>
  );
}
