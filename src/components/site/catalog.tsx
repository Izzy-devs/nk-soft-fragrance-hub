import Link from "next/link";
import { ProductGrid } from "@/components/site/product-card";
import { type CatalogQuery, PAGE_SIZE, getCategories, searchProducts } from "@/lib/data";

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => (v && /^\d+$/.test(v) ? Number(v) : undefined);

export function parseQuery(params: Params, categorySlug?: string): CatalogQuery {
  const sort = one(params.sort);
  return {
    q: one(params.q)?.slice(0, 80), categorySlug: categorySlug ?? one(params.category),
    min: num(one(params.min)), max: num(one(params.max)),
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "newest",
    page: num(one(params.page)) ?? 1,
  };
}

export async function Catalog({ params, categorySlug, basePath }: { params: Params; categorySlug?: string; basePath: string }) {
  const query = parseQuery(params, categorySlug);
  const [{ products, total }, categories] = await Promise.all([searchProducts(query), getCategories()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page ?? 1, pages);

  const link = (p: number) => {
    const sp = new URLSearchParams();
    if (query.q) sp.set("q", query.q);
    if (!categorySlug && query.categorySlug) sp.set("category", query.categorySlug);
    if (query.min !== undefined) sp.set("min", String(query.min));
    if (query.max !== undefined) sp.set("max", String(query.max));
    if (query.sort && query.sort !== "newest") sp.set("sort", query.sort);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="container-x py-10 md:py-14">
      <form action={basePath} className="grid gap-3 border-b border-line pb-8 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1.2fr_auto] lg:items-end" role="search">
        <div>
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" type="search" defaultValue={query.q} placeholder="Perfume name or brand" autoFocus={one(params.focus) === "search"} className="field" />
        </div>
        {!categorySlug && (
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" defaultValue={query.categorySlug ?? ""} className="field">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="min" className="label">Min price (₦)</label>
          <input id="min" name="min" type="number" inputMode="numeric" min={0} defaultValue={query.min} className="field" />
        </div>
        <div>
          <label htmlFor="max" className="label">Max price (₦)</label>
          <input id="max" name="max" type="number" inputMode="numeric" min={0} defaultValue={query.max} className="field" />
        </div>
        <div>
          <label htmlFor="sort" className="label">Sort by</label>
          <select id="sort" name="sort" defaultValue={query.sort} className="field">
            <option value="newest">Newest arrivals</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <button type="submit" className="btn btn-dark">Apply</button>
      </form>

      <p className="mt-6 text-sm text-taupe" role="status">{total} {total === 1 ? "product" : "products"}</p>

      <div className="mt-6">
        {products.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center">
            <p className="font-display text-3xl">No fragrances found</p>
            <p className="mt-2 text-taupe">Try a different search or clear the filters.</p>
            <Link href={basePath} className="btn btn-dark mt-6">Clear filters</Link>
          </div>
        ) : <ProductGrid products={products} />}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && <Link href={link(page - 1)} className="btn btn-line btn-sm">Previous</Link>}
          <span className="text-sm">Page {page} of {pages}</span>
          {page < pages && <Link href={link(page + 1)} className="btn btn-line btn-sm">Next</Link>}
        </nav>
      )}
    </div>
  );
}
