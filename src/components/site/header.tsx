import Link from "next/link";
import type { Settings } from "@/lib/types";
import { CartLink, DesktopNav, MobileNav } from "./header-client";
import { Logo } from "./logo";

export function Header({ settings }: { settings: Settings }) {
  return (
    <>
      {settings.announcement_active && settings.announcement && (
        <div className="bg-burgundy px-4 py-2 text-center text-sm text-ivory">{settings.announcement}</div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4">
          <Logo name={settings.business_name} logoUrl={settings.logo_url} />
          <DesktopNav />
          <div className="flex items-center">
            <form action="/shop" role="search" className="hidden items-center border-b border-ink/40 md:flex">
              <label htmlFor="header-search" className="sr-only">Search perfumes or brands</label>
              <input id="header-search" name="q" type="search" placeholder="Search perfumes" className="w-44 bg-transparent py-1 text-base outline-none placeholder:text-taupe" />
              <button type="submit" aria-label="Search" className="p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
              </button>
            </form>
            <Link href="/shop?focus=search" className="inline-flex h-12 w-12 items-center justify-center md:hidden" aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            </Link>
            <CartLink />
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
