import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categories" };

export default async function CategoriesAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (<div><h1 className="mb-8 text-4xl">Categories</h1><CategoryManager categories={(data ?? []) as Category[]} /></div>);
}
