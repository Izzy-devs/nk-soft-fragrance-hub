"use client";

import { useRef, useState } from "react";
import { removeUploaded, uploadImage } from "@/lib/upload";

export type UploadedImage = { url: string; path: string | null; isNew?: boolean };
type Pending = { id: string; preview: string; error?: string };

export function ImageUploader({ value, onChange, folder, multiple = true, max = 8, label = "Add photos" }: {
  value: UploadedImage[]; onChange: (v: UploadedImage[]) => void; folder: string; multiple?: boolean; max?: number; label?: string;
}) {
  const [pending, setPending] = useState<Pending[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef(value);
  latest.current = value;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, (multiple ? max : 1) - (multiple ? value.length : 0)));
    e.target.value = "";
    for (const file of files) {
      const id = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setPending((p) => [...p, { id, preview }]);
      try {
        const up = await uploadImage(file, folder);
        const next = multiple ? [...latest.current, { ...up, isNew: true }] : [{ ...up, isNew: true }];
        if (!multiple) latest.current.filter((i) => i.isNew && i.path).forEach((i) => removeUploaded(i.path!));
        latest.current = next;
        onChange(next);
        setPending((p) => p.filter((x) => x.id !== id));
        URL.revokeObjectURL(preview);
      } catch (err) {
        setPending((p) => p.map((x) => (x.id === id ? { ...x, error: err instanceof Error ? err.message : "Upload failed" } : x)));
      }
    }
  }

  const remove = (i: number) => {
    const img = value[i];
    if (img.isNew && img.path) removeUploaded(img.path); // only delete files uploaded in this session
    onChange(value.filter((_, n) => n !== i));
  };
  const makeMain = (i: number) => onChange([value[i], ...value.filter((_, n) => n !== i)]);
  const full = multiple && value.length >= max;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.url} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" />
            <div className="space-y-1 p-2 text-sm">
              {multiple && (i === 0 ? <p className="font-medium text-gold-text">Main photo</p> : <button type="button" onClick={() => makeMain(i)} className="min-h-10 w-full underline underline-offset-4">Make main</button>)}
              <button type="button" onClick={() => remove(i)} className="min-h-10 w-full text-red-800 underline underline-offset-4">Remove</button>
            </div>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.id} className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt="Uploading preview" className={`aspect-square w-full object-cover ${p.error ? "" : "opacity-50"}`} />
            <div className="p-2 text-sm" role="status">
              {p.error ? (<><p className="err">{p.error}</p><button type="button" className="min-h-10 underline" onClick={() => setPending((x) => x.filter((y) => y.id !== p.id))}>Dismiss</button></>) : "Uploading"}
            </div>
          </li>
        ))}
      </ul>
      {!full && (
        <label className="btn btn-line mt-3 cursor-pointer text-ink focus-within:outline focus-within:outline-2 focus-within:outline-gold">
          {label}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={onPick} className="sr-only" />
        </label>
      )}
      <p className="hint mt-2">Choose photos from your phone gallery or camera. JPG, PNG or WebP. Large photos are resized automatically.</p>
    </div>
  );
}
