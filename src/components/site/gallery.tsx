"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { BottleArt } from "./art";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  if (images.length === 0) {
    return <div className="flex aspect-[4/5] items-center justify-center bg-cream p-16"><BottleArt tone="light" className="h-full w-auto" /></div>;
  }
  return (
    <div>
      <button type="button" onClick={() => dialog.current?.showModal()} className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-cream" aria-label="Enlarge image">
        <Image src={images[active]} alt={`${name}, image ${active + 1}`} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
      </button>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`} aria-current={i === active} className={`relative block h-20 w-16 overflow-hidden border-2 ${i === active ? "border-ink" : "border-transparent"}`}>
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <dialog ref={dialog} className="m-auto max-h-[92vh] max-w-[92vw] bg-ink p-2 backdrop:bg-black/80" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <div className="relative h-[80vh] w-[88vw] max-w-3xl">
          <Image src={images[active]} alt={`${name}, enlarged`} fill sizes="90vw" className="object-contain" />
        </div>
        <button type="button" onClick={() => dialog.current?.close()} className="btn btn-gold btn-sm mt-2 w-full">Close</button>
      </dialog>
    </div>
  );
}
