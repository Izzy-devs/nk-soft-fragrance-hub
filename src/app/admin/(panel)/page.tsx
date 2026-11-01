import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatNaira } from "@/lib/format";
import { type Order, stockOf, type Product } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [totalProducts, totalOrders, pending, completed, paid, products, recent] = await Promise.all([
    count(supabase.from("products").select("id", { count: "exact", head: true })),
    count(supabase.from("orders").select("id", { count: "exact", head: true })),
    count(supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "pending")),
    count(supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "delivered")),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("products").select("id, name, stock_quantity, low_stock_threshold, variants:product_variants(stock_quantity)"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const sales = (paid.data ?? []).reduce((s, o) => s + (o.total as number), 0);
  const low = ((products.data ?? []) as unknown as Pick<Product, "id" | "name" | "stock_quantity" | "low_stock_threshold" | "variants">[])
    .filter((p) => stockOf(p) <= p.low_stock_threshold).sort((a, b) => stockOf(a) - stockOf(b));
  const orders = (recent.data ?? []) as Order[];

  const stats = [["Total products", totalProducts], ["Total orders", totalOrders], ["Pending orders", pending], ["Completed orders", completed], ["Total sales (paid orders)", formatNaira(sales)]];

  return (
    <div className="space-y-10">
      <h1 className="text-4xl">Dashboard</h1>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([k, v]) => (<div key={k} className="card p-4"><dt className="text-sm text-taupe">{k}</dt><dd className="mt-1 font-display text-3xl">{v}</dd></div>))}
      </dl>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl">Low stock</h2>
          {low.length === 0 ? <p className="mt-3 text-taupe">No products are running low.</p> : (
            <ul className="card mt-3 divide-y divide-line">
              {low.map((p) => (<li key={p.id}><Link href={`/admin/products/${p.id}`} className="flex justify-between gap-3 p-3 hover:bg-cream"><span>{p.name}</span><span className={stockOf(p) === 0 ? "text-burgundy" : ""}>{stockOf(p) === 0 ? "Out of stock" : `${stockOf(p)} left`}</span></Link></li>))}
            </ul>
          )}
        </section>
        <section>
          <div className="flex items-end justify-between"><h2 className="text-2xl">Recent orders</h2><Link href="/admin/orders" className="underline underline-offset-4">All orders</Link></div>
          {orders.length === 0 ? <p className="mt-3 text-taupe">No orders yet. They will appear here as customers check out.</p> : (
            <ul className="card mt-3 divide-y divide-line">
              {orders.map((o) => (<li key={o.id}><Link href={`/admin/orders/${o.id}`} className="flex flex-wrap justify-between gap-x-3 p-3 hover:bg-cream"><span>{o.order_number} · {o.customer_name}</span><span>{formatNaira(o.total)}</span><span className="w-full text-sm text-taupe">{formatDate(o.created_at)} · {o.order_status} · {o.payment_status}</span></Link></li>))}
            </ul>
          )}
        </section>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row"><Link href="/admin/products/new" className="btn btn-dark">Add a product</Link><Link href="/admin/settings" className="btn btn-line">Store settings</Link></div>
    </div>
  );
}
