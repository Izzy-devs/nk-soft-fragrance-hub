"use client";

import { useEffect } from "react";

export function AutoWhatsApp({ url }: { url: string }) {
  useEffect(() => {
    const t = setTimeout(() => window.location.assign(url), 1500);
    return () => clearTimeout(t);
  }, [url]);
  return null;
}
