import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/site/catalog";
import { CatalogSkeleton } from "@/components/site/skeleton";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description: "Browse Arabian perfumes, designer fragrances, body sprays and more. Filter by category and price.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <>
      <div className="bg-ink py-12 text-ivory md:py-16"><div className="container-x"><h1 className="text-5xl md:text-6xl">The collection</h1></div></div>
      <Suspense key={JSON.stringify(params)} fallback={<CatalogSkeleton />}><Catalog params={params} basePath="/shop" /></Suspense>
    </>
  );
}
