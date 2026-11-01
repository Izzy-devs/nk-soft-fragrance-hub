import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const phone = z.string().trim().transform((s) => s.replace(/[\s()-]/g, "")).pipe(z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number"));

export const checkoutSchema = z.object({
  name: text(120).min(2, "Enter your full name"),
  phone,
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address").max(200)]),
  address: text(300).min(5, "Enter your delivery address"),
  state: text(60).min(2, "Select your state"),
  city: text(80).min(2, "Enter your city"),
  notes: text(500).optional().default(""),
  paymentMethod: z.enum(["paystack", "flutterwave", "bank_transfer", "whatsapp"]),
  website: z.string().max(0).optional().default(""), // honeypot
  items: z.array(z.object({
    productId: z.uuid(),
    variantId: z.uuid().nullable().optional(),
    quantity: z.number().int().min(1).max(50),
  })).min(1, "Your cart is empty").max(50),
});
export type CheckoutInput = z.input<typeof checkoutSchema>;

export const emailSchema = z.string().trim().email().max(200);

const intField = (max = 100_000_000) => z.number().int().min(0).max(max);

export const productSchema = z.object({
  id: z.uuid().optional(),
  name: text(160).min(2, "Enter a product name"),
  brand: text(120),
  description: text(5000),
  price: intField(),
  categoryId: z.uuid().nullable(),
  stockQuantity: intField(100_000),
  lowStockThreshold: intField(10_000),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  variants: z.array(z.object({
    id: z.uuid().optional(),
    label: text(60).min(1, "Each size needs a label"),
    price: intField().nullable(),
    stockQuantity: intField(100_000),
  })).max(12),
  images: z.array(z.object({ url: z.url(), path: z.string().max(300).nullable() })).max(10),
});
export type ProductInput = z.input<typeof productSchema>;

export const categorySchema = z.object({
  id: z.uuid().optional(),
  name: text(80).min(2, "Enter a category name"),
  description: text(300),
  sortOrder: z.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

const url = z.union([z.literal(""), z.url().max(300)]);
export const settingsSchema = z.object({
  business_name: text(120).min(2),
  logo_url: z.url().nullable(),
  hero_image_url: z.url().nullable(),
  whatsapp_number: z.string().trim().max(20).regex(/^[+0-9\s-]*$/, "Digits only, e.g. 2348012345678"),
  phone: text(40), email: z.union([z.literal(""), z.string().trim().email().max(200)]),
  address: text(300),
  instagram_url: url, tiktok_url: url, telegram_url: url, facebook_url: url,
  delivery_info: text(1500), delivery_fee: intField(10_000_000), bank_details: text(600),
  enabled_payment_methods: z.array(z.enum(["paystack", "flutterwave", "bank_transfer", "whatsapp"])),
  announcement: text(200), announcement_active: z.boolean(),
  testimonials: z.array(z.object({ name: text(80).min(1), quote: text(400).min(1) })).max(6),
});
export type SettingsInput = z.input<typeof settingsSchema>;
