import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Subscribers" };

export default async function Subscribers() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("newsletter_subscribers").select("email, created_at").order("created_at", { ascending: false }).limit(1000);
  const rows = data ?? [];
  return (
    <div>
      <h1 className="text-4xl">Newsletter subscribers</h1>
      <p className="mt-2 text-taupe">{rows.length} {rows.length === 1 ? "person has" : "people have"} subscribed.</p>
      {rows.length === 0 ? <p className="mt-8 border border-dashed border-line p-10 text-center text-taupe">No subscribers yet.</p> : (
        <ul className="card mt-6 divide-y divide-line">{rows.map((r) => <li key={r.email} className="flex justify-between gap-3 p-3"><span className="break-all">{r.email}</span><span className="shrink-0 text-sm text-taupe">{formatDate(r.created_at)}</span></li>)}</ul>
      )}
    </div>
  );
}
