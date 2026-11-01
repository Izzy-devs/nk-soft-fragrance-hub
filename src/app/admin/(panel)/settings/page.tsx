import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/data";
import type { Settings } from "@/lib/types";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as Settings;
  if (!Array.isArray(settings.testimonials)) settings.testimonials = [];
  return (<div><h1 className="mb-8 text-4xl">Store settings</h1><SettingsForm settings={settings} /></div>);
}
