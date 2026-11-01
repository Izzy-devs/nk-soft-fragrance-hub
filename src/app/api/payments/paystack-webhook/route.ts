import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyPaymentOutcome, verifyPaystack } from "@/lib/payments";
import { createServiceSupabase } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Set this URL in Paystack Dashboard > Settings > API Keys & Webhooks. */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });

  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(sig, "hex"), b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ ok: false }, { status: 401 });

  const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  const reference = event.data?.reference;
  if (event.event === "charge.success" && reference) {
    const { data } = await createServiceSupabase().from("orders").select("*").eq("payment_reference", reference).maybeSingle();
    const order = data as Order | null;
    if (order) await applyPaymentOutcome(order.id, await verifyPaystack(reference, order));
  }
  return NextResponse.json({ ok: true });
}
