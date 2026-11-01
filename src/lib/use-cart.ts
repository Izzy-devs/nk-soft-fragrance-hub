"use client";
import { useSyncExternalStore } from "react";
import { cartStore } from "@/lib/cart-store";

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  return {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}
