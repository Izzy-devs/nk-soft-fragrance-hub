import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** Returns the signed-in admin, or throws/redirects. Call at the top of every admin page and action. */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row) redirect("/admin/login?error=not-admin");
  return { supabase, user: data.user };
}
