import "server-only";
import { createServiceSupabase } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export const paystackConfigured = () => Boolean(process.env.PAYSTACK_SECRET_KEY);
export const flutterwaveConfigured = () => Boolean(process.env.FLUTTERWAVE_SECRET_KEY);

export async function initPaystack(order: { order_number: string; total: number; public_token: string }, email: string, siteUrl: string) {
  const reference = `${order.order_number}-${Date.now().toString(36)}`;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email, amount: order.total * 100, currency: "NGN", reference,
      callback_url: `${siteUrl}/api/payments/verify?provider=paystack&token=${order.public_token}`,
      metadata: { order_number: order.order_number },
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) throw new Error(json?.message ?? "Paystack could not start the payment");
  return { reference, url: json.data.authorization_url as string };
}

export async function initFlutterwave(
  order: { order_number: string; total: number; public_token: string },
  customer: { email: string; name: string; phone: string }, siteUrl: string, businessName: string,
) {
  const reference = `${order.order_number}-${Date.now().toString(36)}`;
  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      tx_ref: reference, amount: order.total, currency: "NGN",
      redirect_url: `${siteUrl}/api/payments/verify?provider=flutterwave&token=${order.public_token}`,
      customer: { email: customer.email, name: customer.name, phonenumber: customer.phone },
      customizations: { title: businessName },
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== "success") throw new Error(json?.message ?? "Flutterwave could not start the payment");
  return { reference, url: json.data.link as string };
}

type Outcome = "paid" | "failed" | "pending";

/** Asks the gateway directly whether the order was paid. Never trusts the browser redirect. */
export async function verifyPaystack(reference: string, order: Pick<Order, "total" | "payment_reference">): Promise<Outcome> {
  if (!paystackConfigured() || reference !== order.payment_reference) return "pending";
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const d = json?.data;
  if (!res.ok || !d) return "pending";
  if (d.status === "success" && d.currency === "NGN" && d.amount === order.total * 100) return "paid";
  return d.status === "failed" ? "failed" : "pending";
}

export async function verifyFlutterwave(transactionId: string, order: Pick<Order, "total" | "payment_reference">): Promise<Outcome> {
  if (!flutterwaveConfigured() || !/^\d+$/.test(transactionId)) return "pending";
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }, cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const d = json?.data;
  if (!res.ok || !d || d.tx_ref !== order.payment_reference) return "pending";
  if (d.status === "successful" && d.currency === "NGN" && Number(d.amount) >= order.total) return "paid";
  return d.status === "failed" ? "failed" : "pending";
}

export async function applyPaymentOutcome(orderId: string, outcome: Outcome) {
  if (outcome === "pending") return;
  const sb = createServiceSupabase();
  // Only move forward from "unpaid" (or "failed" -> "paid"); never overwrite refunds.
  const allowed = outcome === "paid" ? ["unpaid", "failed"] : ["unpaid"];
  await sb.from("orders").update({ payment_status: outcome }).eq("id", orderId).in("payment_status", allowed);
}
