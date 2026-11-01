import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES, type Order } from "@/lib/types";

export const metadata = { title: "Orders" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; payment?: string }> }) {
  const { supabase } = await requireAdmin();
  const { q, status, payment } = await searchParams;
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("order_status", status);
  if (payment && (PAYMENT_STATUSES as readonly string[]).includes(payment)) query = query.eq("payment_status", payment);
  const term = q?.replace(/[%*,()\\]/g, " ").trim();
  if (term) query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);
  const orders = ((await query).data ?? []) as Order[];

  return (
    <div>
      <h1 className="text-4xl">Orders</h1>
      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" role="search">
        <div><label htmlFor="q" className="label">Search</label><input id="q" name="q" defaultValue={q} placeholder="Order number, name or phone" className="field" /></div>
        <div><label htmlFor="status" className="label">Order status</label><select id="status" name="status" defaultValue={status ?? ""} className="field"><option value="">All</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select></div>
        <div><label htmlFor="payment" className="label">Payment status</label><select id="payment" name="payment" defaultValue={payment ?? ""} className="field"><option value="">All</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select></div>
        <button className="btn btn-dark">Filter</button>
      </form>
      {orders.length === 0 ? <p className="mt-8 border border-dashed border-line p-10 text-center text-taupe">No orders found.</p> : (
        <ul className="card mt-6 divide-y divide-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="grid gap-1 p-4 hover:bg-cream sm:grid-cols-[1fr_auto]">
                <span className="font-medium">{o.order_number} · {o.customer_name}</span>
                <span className="sm:text-right">{formatNaira(o.total)}</span>
                <span className="text-sm text-taupe">{formatDate(o.created_at)} · {cap(o.order_status)} · {cap(o.payment_status)}{o.payment_mode === "test" ? " (test mode)" : ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
