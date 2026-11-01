"use server";

import { createServiceSupabase } from "@/lib/supabase/admin";
import { emailSchema } from "@/lib/validators";

export async function subscribeAction(_: unknown, formData: FormData): Promise<{ ok: boolean; message: string }> {
  if (formData.get("website")) return { ok: true, message: "Thank you for subscribing." }; // honeypot
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const { error } = await createServiceSupabase().from("newsletter_subscribers").upsert({ email: parsed.data.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return { ok: false, message: "We could not subscribe you right now. Please try again later." };
  return { ok: true, message: "Thank you for subscribing." };
}
