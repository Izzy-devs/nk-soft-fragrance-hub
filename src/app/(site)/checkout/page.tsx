import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/checkout-form";
import { getSettings } from "@/lib/data";
import { flutterwaveConfigured, paystackConfigured } from "@/lib/payments";
import type { PaymentMethod } from "@/lib/types";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const s = await getSettings();
  const order: PaymentMethod[] = ["paystack", "flutterwave", "bank_transfer", "whatsapp"];
  const methods = order.filter((m) => s.enabled_payment_methods.includes(m) && (m !== "whatsapp" || s.whatsapp_number) && (m !== "bank_transfer" || s.bank_details));
  const testMethods: PaymentMethod[] = [];
  if (!paystackConfigured()) testMethods.push("paystack");
  if (!flutterwaveConfigured()) testMethods.push("flutterwave");
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="text-5xl">Checkout</h1>
      <CheckoutForm methods={methods} testMethods={testMethods} deliveryFee={s.delivery_fee} deliveryInfo={s.delivery_info} />
    </div>
  );
}
