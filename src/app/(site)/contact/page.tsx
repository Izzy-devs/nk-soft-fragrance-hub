import type { Metadata } from "next";
import { SocialLinks } from "@/components/site/social";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Contact", description: "Contact NK Soft Fragrance Hub by phone, WhatsApp, email or social media." };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp_number, "Hello, I have a question about your fragrances.");
  const rows = [
    s.phone && ["Phone", <a key="p" href={`tel:${s.phone}`} className="underline underline-offset-4">{s.phone}</a>],
    s.email && ["Email", <a key="e" href={`mailto:${s.email}`} className="break-all underline underline-offset-4">{s.email}</a>],
    s.address && ["Address", s.address],
  ].filter(Boolean) as [string, React.ReactNode][];
  return (
    <div className="container-x max-w-3xl py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl">Contact us</h1>
      {rows.length === 0 && !wa && <p className="mt-6 text-taupe">Contact details have not been added yet. The store owner can add them in Admin, then Settings.</p>}
      <dl className="mt-8 divide-y divide-line border-y border-line">
        {rows.map(([k, v]) => (<div key={k} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr]"><dt className="text-taupe">{k}</dt><dd>{v}</dd></div>))}
      </dl>
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-8">Chat on WhatsApp</a>}
      <SocialLinks settings={s} className="mt-8" />
      {s.delivery_info && (<section className="mt-12"><h2 className="text-3xl">Delivery and payment</h2><p className="mt-3 whitespace-pre-line text-taupe">{s.delivery_info}</p></section>)}
    </div>
  );
}
