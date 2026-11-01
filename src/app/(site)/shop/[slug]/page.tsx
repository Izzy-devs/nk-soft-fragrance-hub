import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/site/add-to-cart";
import { Gallery } from "@/components/site/gallery";
import { ProductGrid } from "@/components/site/product-card";
import { getProductBySlug, getRelated } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { fromPrice, isInStock, primaryImage, sortedImages, stockOf } from "@/lib/types";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const img = primaryImage(p);
  const description = (p.description || `${p.name}${p.brand ? ` by ${p.brand}` : ""} at NK Soft Fragrance Hub.`).slice(0, 160);
  return {
    title: p.name, description, alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: p.name, description, type: "website", images: img ? [{ url: img }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelated(product);
  const inStock = isInStock(product);
  const stock = stockOf(product);
  const images = sortedImages(product).map((i) => i.url);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.name,
    description: product.description || undefined, brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: images, url: `${SITE_URL}/shop/${product.slug}`,
    offers: { "@type": "Offer", priceCurrency: "NGN", price: fromPrice(product), availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <div className="container-x py-8 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-taupe">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        {product.category && <> / <Link href={`/category/${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link></>}
      </nav>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={images} name={product.name} />
        <div>
          {product.brand && <p className="text-taupe">{product.brand}</p>}
          <h1 className="mt-1 text-4xl md:text-5xl">{product.name}</h1>
          {product.is_sample && <p className="mt-3 inline-block bg-cream px-3 py-1 text-sm">Sample product: not real inventory</p>}
          <p className={`mt-4 text-sm ${inStock ? "text-taupe" : "text-burgundy"}`}>
            {inStock ? (stock <= product.low_stock_threshold ? `Only ${stock} left in stock` : "In stock") : "Currently unavailable"}
          </p>
          <div className="mt-6"><BuyBox product={product} available={product.is_available} /></div>
          {product.description && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="text-2xl">About this fragrance</h2>
              <p className="mt-3 whitespace-pre-line text-taupe">{product.description}</p>
            </div>
          )}
          {product.category && <p className="mt-6 text-sm"><span className="text-taupe">Category: </span><Link href={`/category/${product.category.slug}`} className="underline underline-offset-4">{product.category.name}</Link></p>}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-3xl md:text-4xl">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
