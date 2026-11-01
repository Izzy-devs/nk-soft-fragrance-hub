import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoWhatsApp } from "@/components/site/auto-whatsapp";
import { getSettings } from "@/lib/data";
import { formatDate, formatNaira } from "@/lib/format";
import { createServiceSupabase } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/lib/types";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ wa?: string; payment?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { wa, payment } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const sb = createServiceSupabase();
  const { data } = await sb.from("orders").select("*, items:order_items(*)").eq("public_token", token).maybeSingle();
  if (!data) notFound();
  const { items, ...rest } = data as Order & { items: OrderItem[] };
  const order = rest as Order;
  const settings = await getSettings();
  const waUrl = whatsappLink(settings.whatsapp_number, buildOrderMessage(order, items));

  return (
    <div className="container-x max-w-3xl py-10 md:py-14">
      <h1 className="text-5xl">Thank you, {order.customer_name.split(" ")[0]}</h1>
      <p className="mt-3 text-lg text-taupe">Your order <strong className="text-ink">{order.order_number}</strong> has been recorded on {formatDate(order.created_at)}.</p>

      {order.payment_mode === "test" && order.payment_method !== "whatsapp" && order.payment_method !== "bank_transfer" && (
        <p className="mt-6 border border-burgundy/40 bg-burgundy/5 p-4 text-burgundy">Test mode: online payment is not configured yet, so no payment was taken. The store will follow up to arrange payment.</p>
      )}
      {payment === "unavailable" && (
        <p className="mt-6 border border-burgundy/40 bg-burgundy/5 p-4 text-burgundy">We could not open the payment page. Your order is saved as unpaid. Please contact the store to complete payment.</p>
      )}
      {order.payment_status === "paid" && <p className="mt-6 border border-gold bg-cream p-4">Payment received. Thank you.</p>}
      {order.payment_status === "failed" && <p className="mt-6 border border-burgundy/40 bg-burgundy/5 p-4 text-burgundy">Your payment did not go through. Please contact the store to try again.</p>}

      {order.payment_method === "bank_transfer" && order.payment_status !== "paid" && (
        <section className="card mt-8 p-6">
          <h2 className="text-2xl">Pay by bank transfer</h2>
          <p className="mt-2 whitespace-pre-line">{settings.bank_details || "The store will send you its account details."}</p>
          <p className="mt-3 text-sm text-taupe">Use <strong>{order.order_number}</strong> as the payment reference and send us your proof of payment on WhatsApp.</p>
        </section>
      )}

      {waUrl && (order.payment_method === "whatsapp" || order.payment_method === "bank_transfer") && (
        <section className="mt-8">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full sm:w-auto">{order.payment_method === "whatsapp" ? "Send order on WhatsApp" : "Send proof of payment on WhatsApp"}</a>
          {wa === "1" && <><p className="mt-3 text-sm text-taupe">Opening WhatsApp now. If nothing happens, tap the button above.</p><AutoWhatsApp url={waUrl} /></>}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-3xl">Order details</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <span>{i.product_name}{i.variant_label ? ` (${i.variant_label})` : ""} <span className="text-taupe">x{i.quantity}</span></span>
              <span>{formatNaira(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
          <div className="flex justify-between text-taupe"><dt>Delivery</dt><dd>{order.delivery_fee > 0 ? formatNaira(order.delivery_fee) : "Confirmed by the store"}</dd></div>
          <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{formatNaira(order.total)}</dd></div>
        </dl>
        <p className="mt-6 text-sm text-taupe">Deliver to: {order.address}, {order.city}, {order.state}</p>
        <p className="text-sm text-taupe">Order status: {order.order_status}. Payment status: {order.payment_status}.</p>
      </section>
      <Link href="/shop" className="btn btn-dark mt-10">Continue shopping</Link>
    </div>
  );
}
