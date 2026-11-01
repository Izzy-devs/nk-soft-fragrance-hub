import type { Settings } from "@/lib/types";

export function socialList(s: Settings) {
  return [
    { label: "Instagram", href: s.instagram_url }, { label: "TikTok", href: s.tiktok_url },
    { label: "Telegram", href: s.telegram_url }, { label: "Facebook", href: s.facebook_url },
  ].filter((x) => x.href);
}

export function SocialLinks({ settings, className = "" }: { settings: Settings; className?: string }) {
  const list = socialList(settings);
  if (!list.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${className}`}>
      {list.map((s) => (
        <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-gold hover:underline">{s.label}</a></li>
      ))}
    </ul>
  );
}
