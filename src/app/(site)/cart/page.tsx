import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="text-5xl">Your cart</h1>
      <CartView deliveryFee={settings.delivery_fee} />
    </div>
  );
}
