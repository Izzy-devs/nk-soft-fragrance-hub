"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { type Product, fromPrice, primaryImage, stockOf } from "@/lib/types";

/** Small add button used on product cards (simple products only). */
export function QuickAdd({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-dark btn-sm w-full"
      onClick={() => {
        cartStore.add({ productId: product.id, variantId: null, slug: product.slug, name: product.name, variantLabel: null, price: product.price, image: primaryImage(product), quantity: 1 }, stockOf(product));
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}

/** Full buy box for the product page: size, quantity, Add to cart, Buy now. */
export function BuyBox({ product, available }: { product: Product; available: boolean }) {
  const router = useRouter();
  const variants = [...product.variants].sort((a, b) => a.sort_order - b.sort_order);
  const [variantId, setVariantId] = useState<string | null>(variants.find((v) => v.stock_quantity > 0)?.id ?? variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = variants.find((v) => v.id === variantId) ?? null;
  const price = variant ? (variant.price ?? product.price) : product.price;
  const stock = variant ? variant.stock_quantity : product.stock_quantity;
  const canBuy = available && stock > 0;
  const max = Math.max(1, Math.min(stock, 50));

  const add = () => cartStore.add({
    productId: product.id, variantId: variant?.id ?? null, slug: product.slug, name: product.name,
    variantLabel: variant?.label ?? null, price, image: primaryImage(product), quantity: qty,
  }, stock);

  return (
    <div>
      <p className="font-display text-4xl">{formatNaira(variants.length ? price : fromPrice(product))}</p>
      {variants.length > 0 && (
        <fieldset className="mt-6">
          <legend className="label">Size</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label key={v.id} className={`cursor-pointer border px-4 py-2.5 ${v.id === variantId ? "border-ink bg-ink text-ivory" : "border-line bg-white"} ${v.stock_quantity < 1 ? "opacity-45" : ""}`}>
                <input type="radio" name="variant" className="sr-only" checked={v.id === variantId} disabled={v.stock_quantity < 1} onChange={() => { setVariantId(v.id); setQty(1); }} />
                {v.label}{v.stock_quantity < 1 ? " (sold out)" : ""}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="mt-6">
        <span className="label" id="qty-label">Quantity</span>
        <div className="inline-flex items-center border border-line bg-white" role="group" aria-labelledby="qty-label">
          <button type="button" className="h-12 w-12 text-xl" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <output className="w-12 text-center" aria-live="polite">{qty}</output>
          <button type="button" className="h-12 w-12 text-xl" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" disabled={!canBuy} className="btn btn-dark flex-1" onClick={() => { add(); setAdded(true); setTimeout(() => setAdded(false), 1800); }}>
          {canBuy ? (added ? "Added to cart" : "Add to cart") : "Unavailable"}
        </button>
        <button type="button" disabled={!canBuy} className="btn btn-gold flex-1" onClick={() => { add(); router.push("/checkout"); }}>Buy now</button>
      </div>
    </div>
  );
}
