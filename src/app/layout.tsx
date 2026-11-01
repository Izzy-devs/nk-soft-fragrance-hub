import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "NK Soft Fragrance Hub | Arabian and Designer Perfumes in Nigeria", template: "%s | NK Soft Fragrance Hub" },
  description: "Shop Arabian perfumes, designer fragrances, body sprays and more from NK Soft Fragrance Hub. Order online and pay in naira.",
  openGraph: { type: "website", siteName: "NK Soft Fragrance Hub", locale: "en_NG" },
};
export const viewport: Viewport = { themeColor: "#17120f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
