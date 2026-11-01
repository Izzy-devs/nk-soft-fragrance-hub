import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-ink focus:p-3 focus:text-ivory">Skip to content</a>
      <Header settings={settings} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
