"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { STORAGE_BUCKET, storagePublicPrefix } from "@/lib/env";
import { slugify } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/types";
import { categorySchema, productSchema, settingsSchema, type ProductInput, type SettingsInput } from "@/lib/validators";

type Result = { ok: true; id?: string } | { ok: false; error: string };
const firstIssue = (e: { issues: { message: string }[] }) => e.issues[0]?.message ?? "Please check the form.";
const refresh = () => revalidatePath("/", "layout");
const pathOf = (url: string) => (url.startsWith(storagePublicPrefix) ? url.slice(storagePublicPrefix.length) : null);

export async function loginAction(_: unknown, formData: FormData): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Email or password is incorrect." };
  const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row) { await supabase.auth.signOut(); return { error: "This account is not an admin account." }; }
  redirect("/admin");
}

export async function signOutAction() {
  await (await createServerSupabase()).auth.signOut();
  redirect("/admin/login");
}

export async function saveProductAction(raw: ProductInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;
  if (p.images.some((i) => !pathOf(i.url))) return { ok: false, error: "One of the images is not from your store storage. Remove it and upload again." };

  const row = {
    name: p.name, brand: p.brand, description: p.description, price: p.price, category_id: p.categoryId,
    stock_quantity: p.stockQuantity, low_stock_threshold: p.lowStockThreshold, is_available: p.isAvailable,
    is_featured: p.isFeatured, is_best_seller: p.isBestSeller, is_new_arrival: p.isNewArrival,
  };

  let id = p.id;
  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { ok: false, error: `Could not save the product: ${error.message}` };
  } else {
    const base = slugify(p.name) || "product";
    for (let attempt = 0; attempt < 4 && !id; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from("products").insert({ ...row, slug }).select("id").single();
      if (!error) id = data.id;
      else if (error.code !== "23505") return { ok: false, error: `Could not save the product: ${error.message}` };
    }
    if (!id) return { ok: false, error: "Could not create a unique web address for this product. Try a different name." };
  }

  // Variants: keep ids of existing rows so carts and orders keep working.
  const { data: existingVariants } = await supabase.from("product_variants").select("id").eq("product_id", id);
  const keep = new Set(p.variants.map((v) => v.id).filter(Boolean));
  const drop = (existingVariants ?? []).map((v) => v.id).filter((vid) => !keep.has(vid));
  if (drop.length) await supabase.from("product_variants").delete().in("id", drop);
  if (p.variants.length) {
    const { error } = await supabase.from("product_variants").upsert(
      p.variants.map((v, i) => ({ ...(v.id ? { id: v.id } : {}), product_id: id, label: v.label, price: v.price, stock_quantity: v.stockQuantity, sort_order: i })));
    if (error) return { ok: false, error: `Saved, but sizes failed: ${error.message}` };
  }

  // Images: first one is the main photo.
  const { data: oldImages } = await supabase.from("product_images").select("url, storage_path").eq("product_id", id);
  await supabase.from("product_images").delete().eq("product_id", id);
  if (p.images.length) {
    const { error } = await supabase.from("product_images").insert(
      p.images.map((img, i) => ({ product_id: id, url: img.url, storage_path: pathOf(img.url), sort_order: i, is_primary: i === 0 })));
    if (error) return { ok: false, error: `Saved, but photos failed: ${error.message}` };
  }
  const kept = new Set(p.images.map((i) => i.url));
  const orphaned = (oldImages ?? []).filter((i) => !kept.has(i.url) && i.storage_path).map((i) => i.storage_path as string);
  if (orphaned.length) await supabase.storage.from(STORAGE_BUCKET).remove(orphaned);

  refresh();
  return { ok: true, id };
}

export async function deleteProductAction(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data: imgs } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: `Could not delete: ${error.message}` };
  const paths = (imgs ?? []).map((i) => i.storage_path).filter((x): x is string => Boolean(x));
  if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  refresh();
  return { ok: true };
}

export async function saveCategoryAction(raw: unknown): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const c = parsed.data;
  const fields = { name: c.name, description: c.description || null, sort_order: c.sortOrder, is_active: c.isActive };
  if (c.id) {
    const { error } = await supabase.from("categories").update(fields).eq("id", c.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const base = slugify(c.name) || "category";
    let { error } = await supabase.from("categories").insert({ ...fields, slug: base });
    if (error?.code === "23505") ({ error } = await supabase.from("categories").insert({ ...fields, slug: `${base}-${Math.random().toString(36).slice(2, 6)}` }));
    if (error) return { ok: false, error: error.message };
  }
  refresh();
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function saveSettingsAction(raw: SettingsInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { error } = await supabase.from("store_settings").update(parsed.data).eq("id", 1);
  if (error) return { ok: false, error: `Could not save settings: ${error.message}` };
  refresh();
  return { ok: true };
}

export async function updateOrderAction(orderId: string, orderStatus: string, paymentStatus: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!(ORDER_STATUSES as readonly string[]).includes(orderStatus) || !(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    return { ok: false, error: "Invalid status." };
  }
  const { data: current } = await supabase.from("orders").select("order_status, payment_status").eq("id", orderId).single();
  if (!current) return { ok: false, error: "Order not found." };
  if (current.order_status !== orderStatus) {
    const { error } = await createServiceSupabase().rpc("update_order_status", { p_order: orderId, p_status: orderStatus });
    if (error) return { ok: false, error: error.message.includes("ORDER_CANCELLED") ? "A cancelled order cannot be changed." : error.message };
  }
  if (current.payment_status !== paymentStatus) {
    const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}
