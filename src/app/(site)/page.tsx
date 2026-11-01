import Image from "next/image";
import Link from "next/link";
import { BottleArt, Lattice } from "@/components/site/art";
import { ProductGrid } from "@/components/site/product-card";
import { socialList } from "@/components/site/social";
import { getCategories, getProducts, getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 60;

function Heading({ title, href, linkText = "View all" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-4xl md:text-5xl">{title}</h2>
      {href && <Link href={href} className="shrink-0 underline underline-offset-4 hover:text-gold-text">{linkText}</Link>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-line p-8 text-center text-taupe">{text}</p>;
}

export default async function HomePage() {
  const [settings, categories, best, fresh, featured] = await Promise.all([
    getSettings(), getCategories(),
    getProducts({ flag: "is_best_seller", limit: 4 }),
    getProducts({ flag: "is_new_arrival", limit: 4 }),
    getProducts({ flag: "is_featured", limit: 4 }),
  ]);
  const wa = whatsappLink(settings.whatsapp_number, "Hello, I would like help choosing a fragrance.");
  const socials = socialList(settings);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ivory">
        <Lattice />
        <div className="container-x relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div className="hero-rise">
            <h1 className="text-[3.2rem] leading-[0.98] sm:text-7xl lg:text-[5.5rem]">Discover your signature scent.</h1>
            <p className="mt-6 max-w-md text-lg text-ivory/80">Explore an exclusive collection of captivating fragrances, from timeless designer scents to luxurious Arabian perfumes.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn btn-gold">Explore collection</Link>
              <Link href="/shop?sort=newest#best-sellers" className="btn btn-line text-ivory">Shop best sellers</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
            {settings.hero_image_url ? (
              <Image src={settings.hero_image_url} alt="NK Soft Fragrance Hub featured fragrance" fill priority sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center border border-gold/40">
                <BottleArt className="h-4/5 w-auto" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <h2 className="text-4xl md:text-5xl">A fragrance for every occasion.</h2>
          <p className="max-w-xl text-lg text-taupe">NK Soft Fragrance Hub brings Arabian perfumes, designer fragrances and everyday body sprays together in one place. Browse the collection, see what is in stock, and order in naira the way that suits you.</p>
        </div>
      </section>

      <section id="categories" className="section bg-cream scroll-mt-20">
        <div className="container-x">
          <Heading title="Shop by category" />
          {categories.length === 0 ? <Empty text="Categories will appear here once they are added in the admin dashboard." /> : (
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/category/${c.slug}`} className="group relative flex h-full min-h-40 flex-col justify-end overflow-hidden border border-line bg-ivory p-5 transition-colors hover:border-ink md:min-h-52 md:p-7">
                    {c.image_url && <Image src={c.image_url} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover opacity-30" />}
                    <h3 className="relative text-2xl md:text-3xl">{c.name}</h3>
                    {c.description && <p className="relative mt-1 hidden text-sm text-taupe md:block">{c.description}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="best-sellers" className="section scroll-mt-20">
        <div className="container-x">
          <Heading title="Best sellers" href="/shop" />
          {best.length ? <ProductGrid products={best} /> : <Empty text="Best sellers will appear here once products are marked as best sellers in the admin dashboard." />}
        </div>
      </section>

      <section className="relative overflow-hidden bg-burgundy py-16 text-ivory md:py-20">
        <Lattice opacity={0.1} />
        <div className="container-x relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl">{settings.announcement_active && settings.announcement ? settings.announcement : "Not sure which scent is yours?"}</h2>
            <p className="mt-3 text-ivory/80">Message us on WhatsApp and we will help you choose.</p>
          </div>
          {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-gold">Chat on WhatsApp</a> : <Link href="/contact" className="btn btn-gold">Contact us</Link>}
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Heading title="New arrivals" href="/shop?sort=newest" />
          {fresh.length ? <ProductGrid products={fresh} /> : <Empty text="New arrivals will appear here once products are marked as new in the admin dashboard." />}
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <Heading title="Featured collection" href="/shop" />
          {featured.length ? <ProductGrid products={featured} /> : <Empty text="Featured products will appear here once they are marked as featured in the admin dashboard." />}
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <h2 className="text-4xl md:text-5xl">Why shop with NK Soft</h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {[
              ["Arabian and designer under one roof", "Oud, musk and amber perfumes sit alongside designer classics and light body sprays."],
              ["Clear prices in naira", "Every price is shown in ₦ and your total is confirmed before you pay."],
              ["Honest stock levels", "Products show whether they are in stock, so you know before you order."],
              ["Order your way", "Pay online, by bank transfer when enabled, or send your order straight to us on WhatsApp."],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-line pt-5">
                <dt className="font-display text-2xl">{t}</dt>
                <dd className="mt-2 text-taupe">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {settings.testimonials.length > 0 && (
        <section className="section bg-cream">
          <div className="container-x">
            <h2 className="text-4xl md:text-5xl">What customers say</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {settings.testimonials.map((t, i) => (
                <figure key={i} className="border-l-2 border-gold pl-5">
                  <blockquote className="font-display text-2xl leading-snug">{t.quote}</blockquote>
                  <figcaption className="mt-3 text-sm text-taupe">{t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {socials.length > 0 && (
        <section className="section bg-ink text-ivory">
          <div className="container-x flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h2 className="text-4xl md:text-5xl">Follow the collection</h2>
            <ul className="flex flex-wrap gap-3">
              {socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="btn btn-line text-ivory">{s.label}</a></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
