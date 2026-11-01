import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/site/catalog";
import { CatalogSkeleton } from "@/components/site/skeleton";
import { getCategories } from "@/lib/data";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return { title: cat.name, description: cat.description ?? `Shop ${cat.name} at NK Soft Fragrance Hub.`, alternates: { canonical: `/category/${slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  const sp = await searchParams;
  return (
    <>
      <div className="bg-ink py-12 text-ivory md:py-16">
        <div className="container-x">
          <h1 className="text-5xl md:text-6xl">{cat.name}</h1>
          {cat.description && <p className="mt-3 max-w-xl text-ivory/75">{cat.description}</p>}
        </div>
      </div>
      <Suspense key={JSON.stringify(sp)} fallback={<CatalogSkeleton />}><Catalog params={sp} categorySlug={slug} basePath={`/category/${slug}`} /></Suspense>
    </>
  );
}
