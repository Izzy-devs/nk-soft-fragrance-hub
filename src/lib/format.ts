const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });
export const formatNaira = (n: number) => `₦${naira.format(n)}`;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

/** Turns 0803... into 234803... so wa.me links work. */
export function toWhatsAppNumber(raw: string) {
  const d = digitsOnly(raw);
  if (d.startsWith("0")) return `234${d.slice(1)}`;
  return d;
}
