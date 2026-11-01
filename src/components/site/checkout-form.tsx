"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { placeOrderAction } from "@/app/actions/checkout";
import { cartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { NIGERIAN_STATES } from "@/lib/states";
import type { PaymentMethod } from "@/lib/types";
import { useCart } from "@/lib/use-cart";

const LABELS: Record<PaymentMethod, { title: string; body: string }> = {
  paystack: { title: "Pay online with Paystack", body: "Card, bank transfer or USSD on Paystack's secure page." },
  flutterwave: { title: "Pay online with Flutterwave", body: "Card, bank transfer or mobile money on Flutterwave's secure page." },
  bank_transfer: { title: "Bank transfer", body: "Transfer to our account after placing your order. We confirm once payment is received." },
  whatsapp: { title: "Order on WhatsApp", body: "Your order is saved, then sent to us on WhatsApp so we can arrange payment and delivery." },
};

export function CheckoutForm({ methods, testMethods, deliveryFee, deliveryInfo }: {
  methods: PaymentMethod[]; testMethods: PaymentMethod[]; deliveryFee: number; deliveryInfo: string;
}) {
  const { items, subtotal } = useCart();
  const [method, setMethod] = useState<PaymentMethod>(methods[0] ?? "whatsapp");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-line p-12 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <Link href="/shop" className="btn btn-dark mt-6">Browse the shop</Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setErrors({}); setFormError("");
    start(async () => {
      const res = await placeOrderAction({
        name: get("name"), phone: get("phone"), email: get("email"), address: get("address"), state: get("state"),
        city: get("city"), notes: get("notes"), website: get("website"), paymentMethod: method,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      });
      if (!res.ok) { setErrors(res.fieldErrors ?? {}); setFormError(res.error); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      cartStore.clear();
      window.location.assign(res.redirect);
    });
  }

  const err = (k: string) => (errors[k] ? <p className="err" role="alert">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]" noValidate>
      <div className="space-y-10">
        {formError && <div role="alert" className="border border-red-300 bg-red-50 p-4 text-red-900">{formError}</div>}
        <section>
          <h2 className="text-3xl">Delivery details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="name">Full name</label><input id="name" name="name" required autoComplete="name" className="field" />{err("name")}</div>
            <div><label className="label" htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="08012345678" className="field" />{err("phone")}</div>
            <div><label className="label" htmlFor="email">Email {method === "paystack" || method === "flutterwave" ? "" : "(optional)"}</label><input id="email" name="email" type="email" autoComplete="email" required={method === "paystack" || method === "flutterwave"} className="field" />{err("email")}</div>
            <div className="sm:col-span-2"><label className="label" htmlFor="address">Delivery address</label><textarea id="address" name="address" required autoComplete="street-address" rows={3} className="field" />{err("address")}</div>
            <div><label className="label" htmlFor="state">State</label>
              <select id="state" name="state" required defaultValue="" className="field"><option value="" disabled>Select state</option>{NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>{err("state")}</div>
            <div><label className="label" htmlFor="city">City or town</label><input id="city" name="city" required autoComplete="address-level2" className="field" />{err("city")}</div>
            <div className="sm:col-span-2"><label className="label" htmlFor="notes">Delivery instructions (optional)</label><textarea id="notes" name="notes" rows={2} className="field" /></div>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        </section>
        <section>
          <h2 className="text-3xl">Payment</h2>
          {methods.length === 0 ? <p className="mt-4 text-burgundy">No payment option is enabled yet. Please contact the store.</p> : (
            <div className="mt-5 space-y-3" role="radiogroup" aria-label="Payment method">
              {methods.map((m) => (
                <label key={m} className={`card block cursor-pointer p-4 ${method === m ? "!border-ink outline outline-1 outline-ink" : ""}`}>
                  <input type="radio" name="payment" className="sr-only" checked={method === m} onChange={() => setMethod(m)} />
                  <span className="block font-medium">{LABELS[m].title}</span>
                  <span className="mt-0.5 block text-sm text-taupe">{LABELS[m].body}</span>
                  {testMethods.includes(m) && <span className="mt-2 block text-sm text-burgundy">Test mode: payment is not configured yet. No money is taken and your order stays unpaid.</span>}
                </label>
              ))}
            </div>
          )}
          {deliveryInfo && <p className="mt-5 text-sm text-taupe">{deliveryInfo}</p>}
        </section>
      </div>

      <aside className="card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl">Order summary</h2>
        <ul className="mt-4 divide-y divide-line">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3 py-3 text-sm">
              <span>{i.name}{i.variantLabel ? ` (${i.variantLabel})` : ""} <span className="text-taupe">x{i.quantity}</span></span>
              <span className="shrink-0">{formatNaira(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 border-t border-line pt-3">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
          <div className="flex justify-between text-taupe"><dt>Delivery</dt><dd>{deliveryFee > 0 ? formatNaira(deliveryFee) : "Confirmed after order"}</dd></div>
          <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{formatNaira(subtotal + deliveryFee)}</dd></div>
        </dl>
        <button type="submit" disabled={pending || methods.length === 0} className="btn btn-dark mt-6 w-full">{pending ? "Placing order" : "Place order"}</button>
        <Link href="/cart" className="mt-3 block text-center text-sm underline underline-offset-4">Back to cart</Link>
      </aside>
    </form>
  );
}
