"use client";

import Image from "next/image";
import Link from "next/link";
import { cartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/use-cart";
import { BottleArt } from "./art";

export function CartView({ deliveryFee }: { deliveryFee: number }) {
  const { items, subtotal } = useCart();
  if (items.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-line p-12 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <p className="mt-2 text-taupe">Find a fragrance you love and add it here.</p>
        <Link href="/shop" className="btn btn-dark mt-6">Browse the shop</Link>
      </div>
    );
  }
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((i) => (
          <li key={i.key} className="flex gap-4 py-5">
            <Link href={`/shop/${i.slug}`} className="relative h-28 w-24 shrink-0 bg-cream">
              {i.image ? <Image src={i.image} alt="" fill sizes="96px" className="object-cover" /> : <BottleArt tone="light" className="h-full w-full p-3" />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/shop/${i.slug}`} className="font-display text-xl leading-snug hover:text-gold-text">{i.name}</Link>
              {i.variantLabel && <p className="text-sm text-taupe">{i.variantLabel}</p>}
              <p className="mt-1 text-sm text-taupe">{formatNaira(i.price)} each</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="inline-flex items-center border border-line bg-white" role="group" aria-label={`Quantity for ${i.name}`}>
                  <button type="button" className="h-11 w-11 text-xl" aria-label="Decrease quantity" onClick={() => cartStore.setQuantity(i.key, i.quantity - 1)}>−</button>
                  <output className="w-10 text-center">{i.quantity}</output>
                  <button type="button" className="h-11 w-11 text-xl" aria-label="Increase quantity" onClick={() => cartStore.setQuantity(i.key, i.quantity + 1)}>+</button>
                </div>
                <p className="font-medium">{formatNaira(i.price * i.quantity)}</p>
                <button type="button" onClick={() => cartStore.remove(i.key)} className="min-h-11 text-sm underline underline-offset-4">Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="card h-fit p-6">
        <h2 className="text-2xl">Order total</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
          <div className="flex justify-between text-taupe"><dt>Delivery</dt><dd>{deliveryFee > 0 ? formatNaira(deliveryFee) : "Confirmed after order"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>Total</dt><dd>{formatNaira(subtotal + deliveryFee)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn btn-dark mt-6 w-full">Proceed to checkout</Link>
        <Link href="/shop" className="btn btn-line mt-3 w-full">Continue shopping</Link>
      </aside>
    </div>
  );
}
