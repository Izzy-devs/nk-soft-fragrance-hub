import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { type Product, isInStock, primaryImage, stockOf } from "@/lib/types";

export const metadata = { title: "Products" };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireAdmin();
  const { q } = await searchParams;
  let query = supabase.from("products").select("*, category:categories(name,slug), images:product_images(*), variants:product_variants(*)").order("created_at", { ascending: false });
  const term = q?.replace(/[%*,()\\]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
  const { data } = await query;
  const products = (data ?? []) as unknown as Product[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Products</h1>
        <Link href="/admin/products/new" className="btn btn-dark">Add a product</Link>
      </div>
      <form className="mt-6 flex gap-2" role="search"><label htmlFor="q" className="sr-only">Search products</label><input id="q" name="q" defaultValue={q} placeholder="Search by name or brand" className="field max-w-sm" /><button className="btn btn-line">Search</button></form>
      {products.length === 0 ? (
        <p className="mt-8 border border-dashed border-line p-10 text-center text-taupe">{term ? "No products match your search." : "No products yet. Add your first perfume to get started."}</p>
      ) : (
        <ul className="card mt-6 divide-y divide-line">
          {products.map((p) => {
            const img = primaryImage(p);
            return (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-cream">
                  <span className="relative h-16 w-14 shrink-0 bg-cream">{img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name}{p.is_sample ? " (sample)" : ""}</span>
                    <span className="block text-sm text-taupe">{formatNaira(p.price)} · {stockOf(p)} in stock · {isInStock(p) ? "Available" : "Unavailable"}</span>
                    <span className="block text-sm text-taupe">{[p.is_featured && "Featured", p.is_best_seller && "Best seller", p.is_new_arrival && "New"].filter(Boolean).join(", ")}</span>
                  </span>
                  <span className="text-sm underline underline-offset-4">Edit</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
