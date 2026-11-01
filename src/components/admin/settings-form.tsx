"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { PaymentMethod, Settings } from "@/lib/types";
import { ImageUploader, type UploadedImage } from "./image-uploader";

const METHODS: [PaymentMethod, string][] = [
  ["paystack", "Paystack (online payment)"], ["flutterwave", "Flutterwave (online payment)"],
  ["bank_transfer", "Bank transfer"], ["whatsapp", "WhatsApp-assisted ordering"],
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [logo, setLogo] = useState<UploadedImage[]>(settings.logo_url ? [{ url: settings.logo_url, path: null }] : []);
  const [hero, setHero] = useState<UploadedImage[]>(settings.hero_image_url ? [{ url: settings.hero_image_url, path: null }] : []);
  const [methods, setMethods] = useState<PaymentMethod[]>(settings.enabled_payment_methods);
  const [testimonials, setTestimonials] = useState(settings.testimonials);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "").trim();
    start(async () => {
      const res = await saveSettingsAction({
        business_name: s("business_name"), logo_url: logo[0]?.url ?? null, hero_image_url: hero[0]?.url ?? null,
        whatsapp_number: s("whatsapp_number"), phone: s("phone"), email: s("email"), address: s("address"),
        instagram_url: s("instagram_url"), tiktok_url: s("tiktok_url"), telegram_url: s("telegram_url"), facebook_url: s("facebook_url"),
        delivery_info: s("delivery_info"), delivery_fee: Math.round(Number(s("delivery_fee").replace(/,/g, "")) || 0), bank_details: s("bank_details"),
        enabled_payment_methods: methods, announcement: s("announcement"), announcement_active: f.get("announcement_active") === "on",
        testimonials: testimonials.filter((t) => t.name.trim() && t.quote.trim()),
      });
      setMsg(res.ok ? { ok: true, text: "Settings saved. The store is updated." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const text = (name: keyof Settings, label: string, type = "text", hint?: string) => (
    <div><label htmlFor={name} className="label">{label}</label><input id={name} name={name} type={type} defaultValue={String(settings[name] ?? "")} className="field" />{hint && <p className="hint mt-1">{hint}</p>}</div>
  );

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-12">
      {msg && <div role="status" className={`border p-4 ${msg.ok ? "border-gold bg-cream" : "border-red-300 bg-red-50 text-red-900"}`}>{msg.text}</div>}
      <section className="space-y-4"><h2 className="text-2xl">Business</h2>
        {text("business_name", "Business name")}
        <div><span className="label">Logo</span><ImageUploader value={logo} onChange={setLogo} folder="branding" multiple={false} label={logo.length ? "Change logo" : "Upload logo"} /></div>
        <div><span className="label">Homepage hero photo</span><ImageUploader value={hero} onChange={setHero} folder="branding" multiple={false} label={hero.length ? "Change photo" : "Upload photo"} /></div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2"><h2 className="text-2xl sm:col-span-2">Contact</h2>
        {text("whatsapp_number", "WhatsApp number", "tel", "International format without +, for example 2348012345678")}
        {text("phone", "Phone number", "tel")}{text("email", "Email address", "email")}
        <div className="sm:col-span-2">{text("address", "Business address")}</div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2"><h2 className="text-2xl sm:col-span-2">Social links</h2>
        {text("instagram_url", "Instagram link", "url")}{text("tiktok_url", "TikTok link", "url")}{text("telegram_url", "Telegram link", "url")}{text("facebook_url", "Facebook link", "url")}
      </section>
      <section className="space-y-4"><h2 className="text-2xl">Delivery and payment</h2>
        <div><label htmlFor="delivery_info" className="label">Delivery information</label><textarea id="delivery_info" name="delivery_info" rows={4} defaultValue={settings.delivery_info} className="field" /></div>
        {text("delivery_fee", "Flat delivery fee (₦)", "text", "Leave 0 if the fee is confirmed with each customer after they order.")}
        <fieldset><legend className="label">Payment options customers can choose</legend>
          {METHODS.map(([m, label]) => (
            <label key={m} className="flex min-h-12 items-center gap-3"><input type="checkbox" checked={methods.includes(m)} onChange={(e) => setMethods(e.target.checked ? [...methods, m] : methods.filter((x) => x !== m))} className="h-5 w-5 accent-[#17120f]" />{label}</label>
          ))}
          <p className="hint">Paystack and Flutterwave only take real payments once their secret keys are added to the server settings. Bank transfer also needs account details below.</p>
        </fieldset>
        <div><label htmlFor="bank_details" className="label">Bank account details (shown to customers who pay by transfer)</label><textarea id="bank_details" name="bank_details" rows={3} defaultValue={settings.bank_details} placeholder={"Bank name\nAccount name\nAccount number"} className="field" /></div>
      </section>
      <section className="space-y-4"><h2 className="text-2xl">Announcement banner</h2>
        {text("announcement", "Banner text")}
        <label className="flex min-h-12 items-center gap-3"><input type="checkbox" name="announcement_active" defaultChecked={settings.announcement_active} className="h-5 w-5 accent-[#17120f]" />Show the banner on the store</label>
      </section>
      <section className="space-y-4"><h2 className="text-2xl">Customer testimonials</h2>
        <p className="hint">Only add real testimonials from customers. The section stays hidden on the store while this list is empty.</p>
        {testimonials.map((t, i) => (
          <div key={i} className="card space-y-3 p-4">
            <div><label className="label" htmlFor={`tn${i}`}>Customer name</label><input id={`tn${i}`} value={t.name} onChange={(e) => setTestimonials(testimonials.map((x, n) => n === i ? { ...x, name: e.target.value } : x))} className="field" /></div>
            <div><label className="label" htmlFor={`tq${i}`}>What they said</label><textarea id={`tq${i}`} rows={2} value={t.quote} onChange={(e) => setTestimonials(testimonials.map((x, n) => n === i ? { ...x, quote: e.target.value } : x))} className="field" /></div>
            <button type="button" onClick={() => setTestimonials(testimonials.filter((_, n) => n !== i))} className="min-h-11 text-red-800 underline underline-offset-4">Remove</button>
          </div>
        ))}
        {testimonials.length < 6 && <button type="button" onClick={() => setTestimonials([...testimonials, { name: "", quote: "" }])} className="btn btn-line btn-sm">Add a testimonial</button>}
      </section>
      <div className="sticky bottom-0 -mx-5 border-t border-line bg-ivory/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button type="submit" disabled={pending} className="btn btn-dark w-full sm:w-auto">{pending ? "Saving" : "Save settings"}</button>
      </div>
    </form>
  );
}
