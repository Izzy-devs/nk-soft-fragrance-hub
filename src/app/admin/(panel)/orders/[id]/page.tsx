import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatNaira, toWhatsAppNumber } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { items, ...rest } = data as Order & { items: OrderItem[] };
  const o = rest as Order;
  return (
    <div>
      <Link href="/admin/orders" className="text-sm underline underline-offset-4">All orders</Link>
      <h1 className="mt-2 text-4xl">{o.order_number}</h1>
      <p className="text-taupe">{formatDate(o.created_at)}{o.payment_mode === "test" ? " (placed in payment test mode)" : ""}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="card p-5">
            <h2 className="text-2xl">Customer</h2>
            <dl className="mt-3 space-y-1">
              <div><dt className="inline text-taupe">Name: </dt><dd className="inline">{o.customer_name}</dd></div>
              <div><dt className="inline text-taupe">Phone: </dt><dd className="inline"><a className="underline" href={`tel:${o.phone}`}>{o.phone}</a> · <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${toWhatsAppNumber(o.phone)}`}>WhatsApp</a></dd></div>
              {o.email && <div><dt className="inline text-taupe">Email: </dt><dd className="inline break-all">{o.email}</dd></div>}
              <div><dt className="inline text-taupe">Delivery: </dt><dd className="inline">{o.address}, {o.city}, {o.state}</dd></div>
              {o.notes && <div><dt className="inline text-taupe">Notes: </dt><dd className="inline">{o.notes}</dd></div>}
              <div><dt className="inline text-taupe">Payment method: </dt><dd className="inline">{o.payment_method.replace("_", " ")}</dd></div>
              {o.payment_reference && <div><dt className="inline text-taupe">Reference: </dt><dd className="inline break-all">{o.payment_reference}</dd></div>}
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="text-2xl">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {items.map((i) => (<li key={i.id} className="flex justify-between gap-4 py-2"><span>{i.product_name}{i.variant_label ? ` (${i.variant_label})` : ""} <span className="text-taupe">x{i.quantity} at {formatNaira(i.unit_price)}</span></span><span>{formatNaira(i.line_total)}</span></li>))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Delivery</dt><dd>{formatNaira(o.delivery_fee)}</dd></div>
              <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{formatNaira(o.total)}</dd></div>
            </dl>
          </section>
        </div>
        <OrderStatusForm orderId={o.id} orderStatus={o.order_status} paymentStatus={o.payment_status} />
      </div>
    </div>
  );
}
