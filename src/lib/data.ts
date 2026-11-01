import { FALLBACK_WHATSAPP, isSupabaseConfigured } from "@/lib/env";
import { createPublicSupabase } from "@/lib/supabase/server";
import type { Category, Product, Settings } from "@/lib/types";

const PRODUCT_SELECT = "*, category:categories(name,slug), images:product_images(*), variants:product_variants(*)";

export const DEFAULT_SETTINGS: Settings = {
  business_name: "NK Soft Fragrance Hub", logo_url: null, hero_image_url: null,
  whatsapp_number: FALLBACK_WHATSAPP, phone: "", email: "", address: "",
  instagram_url: "", tiktok_url: "", telegram_url: "", facebook_url: "",
  delivery_info: "Delivery fees and timelines are confirmed after you place your order.",
  delivery_fee: 0, bank_details: "", enabled_payment_methods: ["whatsapp"],
  announcement: "", announcement_active: false, testimonials: [],
};

export async function getSettings(): Promise<Settings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data } = await createPublicSupabase().from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  const merged = { ...DEFAULT_SETTINGS, ...data } as Settings;
  if (!merged.whatsapp_number) merged.whatsapp_number = FALLBACK_WHATSAPP;
  if (!Array.isArray(merged.testimonials)) merged.testimonials = [];
  return merged;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await createPublicSupabase().from("categories").select("*").eq("is_active", true).order("sort_order");
  return (data ?? []) as Category[];
}

export async function getProducts(opts: {
  flag?: "is_featured" | "is_best_seller" | "is_new_arrival";
  limit?: number;
} = {}): Promise<Product[]> {
  if (!isSupabaseConfigured) return [];
  let q = createPublicSupabase().from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (opts.flag) q = q.eq(opts.flag, true);
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data ?? []) as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await createPublicSupabase().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return (data as unknown as Product) ?? null;
}

export async function getRelated(product: Product): Promise<Product[]> {
  if (!isSupabaseConfigured || !product.category_id) return [];
  const { data } = await createPublicSupabase()
    .from("products").select(PRODUCT_SELECT)
    .eq("category_id", product.category_id).neq("id", product.id).limit(4);
  return (data ?? []) as unknown as Product[];
}

export type CatalogQuery = {
  q?: string; categorySlug?: string; min?: number; max?: number;
  sort?: "newest" | "price-asc" | "price-desc"; page?: number;
};
export const PAGE_SIZE = 12;

export async function searchProducts(query: CatalogQuery): Promise<{ products: Product[]; total: number }> {
  if (!isSupabaseConfigured) return { products: [], total: 0 };
  const sb = createPublicSupabase();
  let q = sb.from("products").select(PRODUCT_SELECT, { count: "exact" });

  if (query.categorySlug) {
    const { data: cat } = await sb.from("categories").select("id").eq("slug", query.categorySlug).maybeSingle();
    if (!cat) return { products: [], total: 0 };
    q = q.eq("category_id", cat.id);
  }
  const term = query.q?.replace(/[%*,()\\]/g, " ").trim();
  if (term) q = q.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
  if (query.min !== undefined) q = q.gte("price", query.min);
  if (query.max !== undefined) q = q.lte("price", query.max);

  if (query.sort === "price-asc") q = q.order("price", { ascending: true });
  else if (query.sort === "price-desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  const page = Math.max(1, query.page ?? 1);
  const { data, count } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return { products: (data ?? []) as unknown as Product[], total: count ?? 0 };
}
