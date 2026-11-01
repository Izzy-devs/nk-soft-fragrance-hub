"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/use-cart";

export function CartLink({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative inline-flex h-12 w-12 items-center justify-center" aria-label={`Shopping cart, ${count} items`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span className={`absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium ${tone === "dark" ? "bg-burgundy text-ivory" : "bg-gold text-ink"}`}>{count}</span>
      )}
    </Link>
  );
}

const LINKS = [
  { href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: "/#categories", label: "Categories" },
  { href: "/about", label: "About us" }, { href: "/contact", label: "Contact" },
];

export function DesktopNav() {
  return (
    <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
      {LINKS.map((l) => <Link key={l.href} href={l.href} className="py-2 hover:text-gold-text">{l.label}</Link>)}
    </nav>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} className="inline-flex h-12 w-12 items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink text-ivory" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex justify-end p-3">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="inline-flex h-12 w-12 items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col px-6">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-white/10 py-5 font-display text-4xl">{l.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
