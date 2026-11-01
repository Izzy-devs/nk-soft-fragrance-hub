export type Category = {
  id: string; name: string; slug: string; description: string | null;
  image_url: string | null; sort_order: number; is_active: boolean;
};
export type ProductImage = { id: string; product_id: string; url: string; storage_path: string | null; sort_order: number; is_primary: boolean };
export type Variant = { id: string; product_id: string; label: string; price: number | null; stock_quantity: number; sort_order: number };
export type Product = {
  id: string; slug: string; name: string; brand: string; description: string; price: number;
  category_id: string | null; stock_quantity: number; low_stock_threshold: number;
  is_available: boolean; is_featured: boolean; is_best_seller: boolean; is_new_arrival: boolean; is_sample: boolean;
  created_at: string;
  category?: { name: string; slug: string } | null;
  images: ProductImage[];
  variants: Variant[];
};
export type Testimonial = { name: string; quote: string };
export type PaymentMethod = "paystack" | "flutterwave" | "bank_transfer" | "whatsapp";
export type Settings = {
  business_name: string; logo_url: string | null; hero_image_url: string | null;
  whatsapp_number: string; phone: string; email: string; address: string;
  instagram_url: string; tiktok_url: string; telegram_url: string; facebook_url: string;
  delivery_info: string; delivery_fee: number; bank_details: string;
  enabled_payment_methods: PaymentMethod[]; announcement: string; announcement_active: boolean;
  testimonials: Testimonial[];
};
export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type Order = {
  id: string; order_number: string; public_token: string; customer_name: string; phone: string; email: string | null;
  address: string; state: string; city: string; notes: string | null; subtotal: number; delivery_fee: number; total: number;
  payment_method: PaymentMethod; payment_status: PaymentStatus; order_status: OrderStatus;
  payment_reference: string | null; payment_mode: "live" | "test"; created_at: string;
};
export type OrderItem = {
  id: string; order_id: string; product_id: string | null; product_name: string; variant_label: string | null;
  unit_price: number; quantity: number; line_total: number;
};

export const stockOf = (p: Pick<Product, "stock_quantity" | "variants">) =>
  p.variants.length ? p.variants.reduce((s, v) => s + v.stock_quantity, 0) : p.stock_quantity;
export const isInStock = (p: Product) => p.is_available && stockOf(p) > 0;
export const primaryImage = (p: Product) =>
  [...p.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]?.url ?? null;
export const sortedImages = (p: Product) =>
  [...p.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
export const fromPrice = (p: Product) =>
  p.variants.length ? Math.min(...p.variants.map((v) => v.price ?? p.price)) : p.price;
