import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import type { Category, Product } from "@/lib/types";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase.from("products").select("*, category:categories(name,slug), images:product_images(*), variants:product_variants(*)").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();
  return (<div><h1 className="mb-8 text-4xl">Edit product</h1><ProductForm product={product as unknown as Product} categories={(cats ?? []) as Category[]} /></div>);
}
