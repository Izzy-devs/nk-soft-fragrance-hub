"use server";

import { headers } from "next/headers";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { flutterwaveConfigured, initFlutterwave, initPaystack, paystackConfigured } from "@/lib/payments";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";

export type CheckoutResult = { ok: true; redirect: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const ERROR_TEXT: Record<string, (arg: string) => string> = {
  EMPTY_CART: () => "Your cart is empty.",
  INVALID_QUANTITY: () => "One of the quantities is not valid.",
  PRODUCT_NOT_FOUND: () => "A product in your cart is no longer available. Please remove it and try again.",
  UNAVAILABLE: (n) => `${n} is currently unavailable. Please remove it from your cart.`,
  OUT_OF_STOCK: (n) => `Not enough stock for ${n}. Please lower the quantity.`,
  VARIANT_REQUIRED: (n) => `Please choose a size for ${n}.`,
};

export async function placeOrderAction(raw: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const input = parsed.data;
  if (input.website) return { ok: false, error: "Could not place order." }; // honeypot

  const settings = await getSettings();
  if (!settings.enabled_payment_methods.includes(input.paymentMethod)) {
    return { ok: false, error: "That payment option is not available. Please choose another." };
  }
  const online = input.paymentMethod === "paystack" || input.paymentMethod === "flutterwave";
  if (online && !input.email) {
    return { ok: false, error: "An email address is required for online payment.", fieldErrors: { email: "Required for online payment" } };
  }
  const configured = input.paymentMethod === "paystack" ? paystackConfigured() : input.paymentMethod === "flutterwave" ? flutterwaveConfigured() : true;
  const mode = configured ? "live" : "test";

  const sb = createServiceSupabase();
  const { data, error } = await sb.rpc("place_order", {
    p_customer: { name: input.name, phone: input.phone, email: input.email, address: input.address, state: input.state, city: input.city, notes: input.notes },
    p_items: input.items.map((i) => ({ product_id: i.productId, variant_id: i.variantId ?? null, quantity: i.quantity })),
    p_payment_method: input.paymentMethod,
    p_payment_mode: mode,
  });
  if (error || !data?.[0]) {
    const m = /(EMPTY_CART|INVALID_QUANTITY|PRODUCT_NOT_FOUND|UNAVAILABLE|OUT_OF_STOCK|VARIANT_REQUIRED)(?::(.*))?/.exec(error?.message ?? "");
    return { ok: false, error: m ? ERROR_TEXT[m[1]]((m[2] ?? "").trim()) : "We could not place your order. Please try again." };
  }
  const order = data[0] as { order_id: string; order_number: string; public_token: string; total: number };
  const done = `/order/${order.public_token}`;

  const origin = SITE_URL || `https://${(await headers()).get("host")}`;
  try {
    if (online && mode === "live") {
      const pay = input.paymentMethod === "paystack"
        ? await initPaystack(order, input.email, origin)
        : await initFlutterwave(order, { email: input.email, name: input.name, phone: input.phone }, origin, settings.business_name);
      await sb.from("orders").update({ payment_reference: pay.reference }).eq("id", order.order_id);
      return { ok: true, redirect: pay.url };
    }
  } catch (e) {
    // Order is saved as unpaid; the customer can still pay another way or contact the store.
    console.error("Payment init failed", e);
    return { ok: true, redirect: `${done}?payment=unavailable` };
  }
  return { ok: true, redirect: input.paymentMethod === "whatsapp" ? `${done}?wa=1` : done };
}
