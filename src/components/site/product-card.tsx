import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { type Product, fromPrice, isInStock, primaryImage, stockOf } from "@/lib/types";
import { QuickAdd } from "./add-to-cart";
import { BottleArt } from "./art";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const img = primaryImage(product);
  const inStock = isInStock(product);
  const stock = stockOf(product);
  const low = inStock && stock <= product.low_stock_threshold;
  const hasVariants = product.variants.length > 0;
  return (
    <article className="group flex flex-col">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-cream" aria-label={`View ${product.name}`}>
        {img ? (
          <Image src={img} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" priority={priority} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center p-10"><BottleArt tone="light" className="h-full max-h-56 w-auto" /></div>
        )}
        {product.is_sample && <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-xs text-ivory">Sample</span>}
        {!inStock && <span className="absolute right-2 top-2 bg-ivory px-2 py-0.5 text-xs">Unavailable</span>}
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        {product.brand && <p className="text-sm text-taupe">{product.brand}</p>}
        <h3 className="mt-0.5 text-xl leading-snug"><Link href={`/shop/${product.slug}`} className="hover:text-gold-text">{product.name}</Link></h3>
        <p className="mt-1">{hasVariants ? "From " : ""}{formatNaira(fromPrice(product))}</p>
        <p className={`mt-0.5 text-sm ${inStock ? "text-taupe" : "text-burgundy"}`}>
          {inStock ? (low ? `Only ${stock} left` : "In stock") : "Out of stock"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/shop/${product.slug}`} className="btn btn-line btn-sm">View product</Link>
          {inStock && !hasVariants ? <QuickAdd product={product} /> : (
            <Link href={`/shop/${product.slug}`} className={`btn btn-sm ${inStock ? "btn-dark" : "btn-line opacity-60"}`}>{inStock ? "Choose size" : "Unavailable"}</Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
      {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
    </div>
  );
}
