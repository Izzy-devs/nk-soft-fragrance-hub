import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const pages = ["", "/shop", "/about", "/contact"].map((p) => ({ url: `${SITE_URL}${p}` }));
  return [
    ...pages,
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/shop/${p.slug}`, lastModified: p.created_at })),
  ];
}
