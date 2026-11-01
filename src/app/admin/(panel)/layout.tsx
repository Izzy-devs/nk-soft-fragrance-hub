import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

const NAV = [
  ["/admin", "Dashboard"], ["/admin/products", "Products"], ["/admin/orders", "Orders"],
  ["/admin/categories", "Categories"], ["/admin/settings", "Settings"], ["/admin/subscribers", "Subscribers"],
] as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="sticky top-0 z-30 bg-ink text-ivory">
        <div className="container-x flex items-center justify-between gap-4 py-3">
          <Link href="/admin" className="font-display text-xl">NK Soft admin</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="underline underline-offset-4">View store</Link>
            <form action={signOutAction}><button className="min-h-10 underline underline-offset-4">Sign out</button></form>
          </div>
        </div>
        <nav aria-label="Admin" className="border-t border-white/10">
          <ul className="container-x flex gap-1 overflow-x-auto">
            {NAV.map(([href, label]) => <li key={href} className="shrink-0"><Link href={href} className="block px-3 py-3 hover:text-gold">{label}</Link></li>)}
          </ul>
        </nav>
      </header>
      <div className="container-x py-8">{children}</div>
    </>
  );
}
