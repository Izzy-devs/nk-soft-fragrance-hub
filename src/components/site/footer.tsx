import Link from "next/link";
import type { Settings } from "@/lib/types";
import { Lattice } from "./art";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter";
import { SocialLinks } from "./social";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <Lattice opacity={0.06} />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo name={settings.business_name} logoUrl={settings.logo_url} tone="light" />
          <p className="mt-4 max-w-xs text-sm text-ivory/70">Arabian perfumes, designer fragrances and body sprays, delivered across Nigeria.</p>
          <SocialLinks settings={settings} className="mt-6" />
        </div>
        <nav aria-label="Footer">
          <h2 className="font-display text-xl">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li><Link href="/shop" className="hover:text-gold">All fragrances</Link></li>
            <li><Link href="/#categories" className="hover:text-gold">Categories</Link></li>
            <li><Link href="/cart" className="hover:text-gold">Cart</Link></li>
            <li><Link href="/about" className="hover:text-gold">About us</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="font-display text-xl">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            {settings.phone && <li><a href={`tel:${settings.phone}`} className="hover:text-gold">{settings.phone}</a></li>}
            {settings.email && <li><a href={`mailto:${settings.email}`} className="break-all hover:text-gold">{settings.email}</a></li>}
            {settings.address && <li>{settings.address}</li>}
            {!settings.phone && !settings.email && !settings.address && <li>Contact details are added in the admin settings.</li>}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl">Stay in the loop</h2>
          <p className="mt-4 text-sm text-ivory/70">New arrivals and offers, sent occasionally.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="relative border-t border-white/10 py-5 text-center text-xs text-ivory/60">
        © {new Date().getFullYear()} {settings.business_name}. All rights reserved.
      </div>
    </footer>
  );
}
