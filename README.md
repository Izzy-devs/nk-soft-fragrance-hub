# NK Soft Fragrance Hub

Luxury fragrance e-commerce site. Next.js 16, TypeScript, Tailwind CSS 4, Supabase (Postgres, Auth, Storage).
The owner manages products, photos, orders and settings from `/admin`, including from a phone.

## 1. Install
```bash
npm install
cp .env.example .env.local   # then fill it in (step 3)
```

## 2. Supabase setup
1. Create a project at supabase.com.
2. SQL Editor > New query > paste `supabase/schema.sql` > Run. This creates tables, Row Level Security policies, order functions and the `store-media` storage bucket with admin-only upload rules. Safe to re-run.
3. Optional: run `supabase/seed.sql` for the six categories and six clearly labelled SAMPLE products (delete them in Admin when real products exist).
4. Project Settings > API: copy the URL, anon/publishable key and service_role key into `.env.local`.
   The service_role key is server only. Never expose or commit it.
5. Authentication > Providers: keep Email enabled. Turn OFF "Allow new users to sign up" so nobody can create accounts (admin access is also gated by the `admin_users` table).

## 3. Create the first admin
```bash
npm run create-admin -- owner@example.com "a-strong-password-here"
```
This creates the login and registers it in `admin_users`. Sign in at `/admin/login`.

## 4. Run locally
```bash
npm run dev      # http://localhost:3000
```

## 5. First steps in Admin
Settings: business name, logo, WhatsApp number (e.g. 2348012345678), phone, email, address, social links, delivery info, bank details, payment options.
Products > Add a product: tap "Add photos" (opens the phone gallery/camera), fill name, price, stock, Save. It appears on the store immediately.

## Payments
- Without keys, Paystack/Flutterwave show "Test mode": the order is recorded as Unpaid and no payment is faked. Admin can mark Paid manually.
- Set `PAYSTACK_SECRET_KEY` / `FLUTTERWAVE_SECRET_KEY` for live payments. Payment is confirmed by asking the gateway server-side (amount, currency, reference), never from the browser redirect.
- Paystack webhook URL: `https://YOUR-SITE/api/payments/paystack-webhook`.
- Bank transfer needs bank details in Settings. WhatsApp orders open a pre-written order summary.

## Deploy (Vercel)
Import the repo, add every variable from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your real domain), deploy. Redeploy after changing `NEXT_PUBLIC_*` values. Also add your domain under Supabase Auth > URL Configuration.

## Notes
- Prices are whole naira. Stock is reduced when an order is placed and restored if the order is cancelled.
- Product photos are resized in the browser (max 1600px, WebP) and uploaded straight to Supabase Storage.
- No product photos are bundled. Placeholders are illustrations; upload real photos in Admin.
- Flutterwave is confirmed on the customer's return redirect only (no Flutterwave webhook).
