"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";
import { sortedImages } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "./image-uploader";

type VariantRow = { id?: string; label: string; price: string; stock: string };

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [images, setImages] = useState<UploadedImage[]>(product ? sortedImages(product).map((i) => ({ url: i.url, path: i.storage_path })) : []);
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? []).sort((a, b) => a.sort_order - b.sort_order).map((v) => ({ id: v.id, label: v.label, price: v.price?.toString() ?? "", stock: String(v.stock_quantity) })));

  const num = (v: FormDataEntryValue | null) => { const n = Number(String(v ?? "").replace(/,/g, "")); return Number.isFinite(n) ? Math.round(n) : NaN; };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const price = num(f.get("price"));
    if (!Number.isFinite(price) || price < 0) { setError("Enter the price as a number, for example 45000."); return; }
    setError("");
    start(async () => {
      const res = await saveProductAction({
        id: product?.id, name: String(f.get("name") ?? ""), brand: String(f.get("brand") ?? ""),
        description: String(f.get("description") ?? ""), price, categoryId: String(f.get("category") ?? "") || null,
        stockQuantity: Number.isFinite(num(f.get("stock"))) ? num(f.get("stock")) : 0,
        lowStockThreshold: Number.isFinite(num(f.get("low"))) ? num(f.get("low")) : 5,
        isAvailable: f.get("available") === "on", isFeatured: f.get("featured") === "on",
        isBestSeller: f.get("best") === "on", isNewArrival: f.get("new") === "on",
        variants: variants.map((v) => ({ id: v.id, label: v.label, price: v.price.trim() === "" ? null : Math.round(Number(v.price)), stockQuantity: Math.round(Number(v.stock) || 0) })),
        images: images.map((i) => ({ url: i.url, path: i.path })),
      });
      if (!res.ok) { setError(res.error); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      router.push("/admin/products");
      router.refresh();
    });
  }

  function remove() {
    if (!product || !window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.ok) { setError(res.error); return; }
      router.push("/admin/products");
      router.refresh();
    });
  }

  const check = (name: string, label: string, on: boolean) => (
    <label className="flex min-h-12 items-center gap-3"><input type="checkbox" name={name} defaultChecked={on} className="h-5 w-5 accent-[#17120f]" />{label}</label>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-10">
      {error && <div role="alert" className="border border-red-300 bg-red-50 p-4 text-red-900">{error}</div>}
      <section className="space-y-4">
        <h2 className="text-2xl">Photos</h2>
        <ImageUploader value={images} onChange={setImages} folder="products" />
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-2xl sm:col-span-2">Details</h2>
        <div className="sm:col-span-2"><label htmlFor="name" className="label">Product name</label><input id="name" name="name" required defaultValue={product?.name} className="field" /></div>
        <div><label htmlFor="brand" className="label">Brand</label><input id="brand" name="brand" defaultValue={product?.brand} className="field" /></div>
        <div><label htmlFor="category" className="label">Category</label>
          <select id="category" name="category" defaultValue={product?.category_id ?? ""} className="field"><option value="">No category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="sm:col-span-2"><label htmlFor="description" className="label">Description</label><textarea id="description" name="description" rows={5} defaultValue={product?.description} className="field" /></div>
        <div><label htmlFor="price" className="label">Price (₦)</label><input id="price" name="price" inputMode="numeric" required defaultValue={product?.price} className="field" /></div>
        <div><label htmlFor="stock" className="label">Stock quantity</label><input id="stock" name="stock" inputMode="numeric" defaultValue={product?.stock_quantity ?? 0} className="field" />
          {variants.length > 0 && <p className="hint mt-1">Sizes below keep their own stock. This number is not used when sizes exist.</p>}</div>
        <div><label htmlFor="low" className="label">Warn me when stock is at or below</label><input id="low" name="low" inputMode="numeric" defaultValue={product?.low_stock_threshold ?? 5} className="field" /></div>
      </section>
      <section>
        <h2 className="text-2xl">Sizes (optional)</h2>
        <p className="hint">Add sizes such as 50ml or 100ml if the price or stock differs. Leave empty for a single-size product.</p>
        <div className="mt-4 space-y-3">
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="card grid grid-cols-2 gap-3 p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <div className="col-span-2 sm:col-span-1"><label className="label" htmlFor={`vl${i}`}>Size label</label><input id={`vl${i}`} value={v.label} onChange={(e) => setVariants(variants.map((x, n) => n === i ? { ...x, label: e.target.value } : x))} placeholder="100ml" className="field" /></div>
              <div><label className="label" htmlFor={`vp${i}`}>Price (₦)</label><input id={`vp${i}`} inputMode="numeric" value={v.price} onChange={(e) => setVariants(variants.map((x, n) => n === i ? { ...x, price: e.target.value } : x))} placeholder="Same as above" className="field" /></div>
              <div><label className="label" htmlFor={`vs${i}`}>Stock</label><input id={`vs${i}`} inputMode="numeric" value={v.stock} onChange={(e) => setVariants(variants.map((x, n) => n === i ? { ...x, stock: e.target.value } : x))} className="field" /></div>
              <button type="button" onClick={() => setVariants(variants.filter((_, n) => n !== i))} className="col-span-2 min-h-12 text-red-800 underline underline-offset-4 sm:col-span-1 sm:self-end">Remove</button>
            </div>
          ))}
        </div>
        {variants.length < 12 && <button type="button" onClick={() => setVariants([...variants, { label: "", price: "", stock: "0" }])} className="btn btn-line btn-sm mt-3">Add a size</button>}
      </section>
      <section>
        <h2 className="text-2xl">Visibility</h2>
        <div className="mt-2">
          {check("available", "Available to buy", product?.is_available ?? true)}
          {check("featured", "Featured collection", product?.is_featured ?? false)}
          {check("best", "Best seller", product?.is_best_seller ?? false)}
          {check("new", "New arrival", product?.is_new_arrival ?? false)}
        </div>
      </section>
      <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-line bg-ivory/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0">
        <button type="submit" disabled={pending} className="btn btn-dark">{pending ? "Saving" : product ? "Save changes" : "Save product"}</button>
        {product && <button type="button" onClick={remove} disabled={pending} className="btn btn-line text-red-800">Delete product</button>}
      </div>
    </form>
  );
}
