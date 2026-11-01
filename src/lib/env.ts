export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const FALLBACK_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const STORAGE_BUCKET = "store-media";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const storagePublicPrefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`;
