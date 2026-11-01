import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About us", description: "About NK Soft Fragrance Hub, a Nigerian fragrance business offering Arabian perfumes, designer fragrances and body sprays." };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="container-x max-w-3xl py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl">About {s.business_name}</h1>
      <div className="mt-8 space-y-5 text-lg text-taupe">
        <p>{s.business_name} is a Nigerian fragrance business offering Arabian perfumes, designer fragrances, luxury perfumes, body sprays and related products.</p>
        <p>This website gives the brand its own home for shopping: browse the collection, check what is in stock, and order in naira, with payment online, by bank transfer when available, or through WhatsApp.</p>
        <p>You can also find us on social media and online marketplaces. Questions about a scent or an order are always welcome.</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className="btn btn-dark">Shop the collection</Link>
        <Link href="/contact" className="btn btn-line">Contact us</Link>
      </div>
    </div>
  );
}
