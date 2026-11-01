import Image from "next/image";
import Link from "next/link";

export function Logo({ name, logoUrl, tone = "dark" }: { name: string; logoUrl: string | null; tone?: "dark" | "light" }) {
  const color = tone === "light" ? "text-ivory" : "text-ink";
  return (
    <Link href="/" className={`flex items-center gap-3 ${color}`} aria-label={`${name} home`}>
      {logoUrl ? (
        <Image src={logoUrl} alt="" width={44} height={44} className="h-11 w-11 object-contain" />
      ) : null}
      <span className="font-display text-2xl leading-none sm:text-[1.7rem]">
        {name === "NK Soft Fragrance Hub" ? (<>NK Soft <span className="text-[0.62em] tracking-wide opacity-80">Fragrance Hub</span></>) : name}
      </span>
    </Link>
  );
}
