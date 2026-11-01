"use client";

import { STORAGE_BUCKET } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIDE = 1600;
const MAX_BYTES = 5 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));

/** Resizes large phone photos (max 1600px) and re-encodes as WebP (or JPEG where WebP is unsupported). */
export async function prepareImage(file: File): Promise<{ blob: Blob; ext: string }> {
  const type = file.type.toLowerCase();
  const isHeic = /hei[cf]/.test(type) || /\.hei[cf]$/i.test(file.name);
  if (!ALLOWED.includes(type) && !isHeic) throw new Error("Choose a JPG, PNG or WebP photo.");
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const webp = await toBlob(canvas, "image/webp", 0.86);
    if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
    const jpg = await toBlob(canvas, "image/jpeg", 0.88);
    if (jpg) return { blob: jpg, ext: "jpg" };
    throw new Error("encode failed");
  } catch {
    if (ALLOWED.includes(type) && file.size <= MAX_BYTES) return { blob: file, ext: type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg" };
    throw new Error("This photo could not be processed. Try a JPG or PNG under 5 MB.");
  }
}

export async function uploadImage(file: File, folder: string): Promise<{ url: string; path: string }> {
  const { blob, ext } = await prepareImage(file);
  const supabase = createBrowserSupabase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const contentType = blob.type || "image/jpeg";
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message.includes("row-level security") ? "You are not allowed to upload. Sign in again." : `Upload failed: ${error.message}`);
  return { url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl, path };
}

export async function removeUploaded(path: string) {
  await createBrowserSupabase().storage.from(STORAGE_BUCKET).remove([path]).catch(() => undefined);
}
