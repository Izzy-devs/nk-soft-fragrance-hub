import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (<div><h1 className="mb-8 text-4xl">Add a product</h1><ProductForm categories={(data ?? []) as Category[]} /></div>);
}
