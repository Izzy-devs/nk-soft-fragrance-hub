import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/env";
import { applyPaymentOutcome, verifyFlutterwave, verifyPaystack } from "@/lib/payments";
import { createServiceSupabase } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const token = p.get("token") ?? "";
  const back = (path: string) => NextResponse.redirect(`${SITE_URL}${path}`);
  if (!/^[0-9a-f-]{36}$/i.test(token)) return back("/");

  const sb = createServiceSupabase();
  const { data } = await sb.from("orders").select("*").eq("public_token", token).maybeSingle();
  const order = data as Order | null;
  if (!order) return back("/");

  let outcome: "paid" | "failed" | "pending" = "pending";
  if (p.get("provider") === "paystack") {
    outcome = await verifyPaystack(p.get("reference") ?? p.get("trxref") ?? "", order);
  } else if (p.get("provider") === "flutterwave") {
    outcome = p.get("status") === "cancelled" ? "failed" : await verifyFlutterwave(p.get("transaction_id") ?? "", order);
  }
  await applyPaymentOutcome(order.id, outcome);
  return back(`/order/${token}`);
}
