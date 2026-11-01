"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategoryAction, saveCategoryAction } from "@/app/admin/actions";
import type { Category } from "@/lib/types";

function Row({ cat, onDone }: { cat?: Category; onDone: (msg?: string) => void }) {
  const [name, setName] = useState(cat?.name ?? "");
  const [description, setDescription] = useState(cat?.description ?? "");
  const [sort, setSort] = useState(String(cat?.sort_order ?? 0));
  const [active, setActive] = useState(cat?.is_active ?? true);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const save = () => start(async () => {
    const res = await saveCategoryAction({ id: cat?.id, name, description, sortOrder: Number(sort) || 0, isActive: active });
    if (!res.ok) { setError(res.error); return; }
    setError(""); if (!cat) { setName(""); setDescription(""); setSort("0"); } onDone();
  });
  const del = () => {
    if (!cat || !window.confirm(`Delete "${cat.name}"? Its products will become uncategorised.`)) return;
    start(async () => { const res = await deleteCategoryAction(cat.id); if (!res.ok) setError(res.error); else onDone(); });
  };
  return (
    <div className="card space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-[1.2fr_2fr_6rem]">
        <div><label className="label" htmlFor={`n${cat?.id ?? "new"}`}>Name</label><input id={`n${cat?.id ?? "new"}`} value={name} onChange={(e) => setName(e.target.value)} className="field" /></div>
        <div><label className="label" htmlFor={`d${cat?.id ?? "new"}`}>Description</label><input id={`d${cat?.id ?? "new"}`} value={description} onChange={(e) => setDescription(e.target.value)} className="field" /></div>
        <div><label className="label" htmlFor={`s${cat?.id ?? "new"}`}>Order</label><input id={`s${cat?.id ?? "new"}`} inputMode="numeric" value={sort} onChange={(e) => setSort(e.target.value)} className="field" /></div>
      </div>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-5 w-5 accent-[#17120f]" />Show on the store</label>
      {error && <p role="alert" className="err">{error}</p>}
      <div className="flex gap-3">
        <button type="button" onClick={save} disabled={pending || name.trim().length < 2} className="btn btn-dark btn-sm">{pending ? "Saving" : cat ? "Save" : "Add category"}</button>
        {cat && <button type="button" onClick={del} disabled={pending} className="btn btn-line btn-sm text-red-800">Delete</button>}
      </div>
    </div>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const done = () => router.refresh();
  return (
    <div className="max-w-3xl space-y-4">
      {categories.map((c) => <Row key={`${c.id}-${c.name}-${c.sort_order}-${c.is_active}`} cat={c} onDone={done} />)}
      <h2 className="pt-4 text-2xl">Add a category</h2>
      <Row onDone={done} />
    </div>
  );
}
