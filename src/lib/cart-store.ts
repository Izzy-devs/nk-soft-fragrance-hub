"use client";

export type CartItem = {
  key: string; productId: string; variantId: string | null; slug: string; name: string;
  variantLabel: string | null; price: number; image: string | null; quantity: number;
};

const KEY = "nk-cart-v1";
const EMPTY: CartItem[] = [];
let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(KEY); } catch { return EMPTY; }
  if (raw === cache.raw) return cache.items;
  let items = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed.filter((i) => i && typeof i.key === "string" && Number.isInteger(i.quantity));
  } catch { items = EMPTY; }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ }
  cache = { raw: null, items: EMPTY };
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    window.addEventListener("storage", cb);
    return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,
  add(item: Omit<CartItem, "key">, max = 50) {
    const key = `${item.productId}:${item.variantId ?? "-"}`;
    const items = [...read()];
    const i = items.findIndex((x) => x.key === key);
    if (i >= 0) items[i] = { ...items[i], ...item, key, quantity: Math.min(max, items[i].quantity + item.quantity) };
    else items.push({ ...item, key });
    write(items);
  },
  setQuantity(key: string, quantity: number) {
    write(read().map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(50, quantity)) } : i)));
  },
  remove(key: string) { write(read().filter((i) => i.key !== key)); },
  clear() { write([]); },
};
