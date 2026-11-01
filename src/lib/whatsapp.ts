import { formatNaira, toWhatsAppNumber } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

const METHOD_LABEL: Record<string, string> = {
  paystack: "Paystack (card/transfer)", flutterwave: "Flutterwave", bank_transfer: "Bank transfer", whatsapp: "Pay via WhatsApp arrangement",
};

export function buildOrderMessage(order: Order, items: OrderItem[]) {
  const lines = items.map((i, n) =>
    `${n + 1}. ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ""} x${i.quantity} - ${formatNaira(i.line_total)}`);
  return [
    `*New order ${order.order_number}*`, "",
    `Name: ${order.customer_name}`, `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.city}, ${order.state}`,
    order.notes ? `Notes: ${order.notes}` : null, "",
    "*Items*", ...lines, "",
    `Subtotal: ${formatNaira(order.subtotal)}`,
    `Delivery: ${order.delivery_fee > 0 ? formatNaira(order.delivery_fee) : "To be confirmed"}`,
    `*Total: ${formatNaira(order.total)}*`, "",
    `Payment: ${METHOD_LABEL[order.payment_method] ?? order.payment_method}`,
  ].filter((l): l is string => l !== null).join("\n");
}

export function whatsappLink(number: string, message: string) {
  const n = toWhatsAppNumber(number);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : "";
}
