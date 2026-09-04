import { config } from "@/lib/config";
import { formatMoney } from "@/lib/currency";

type OrderForWhatsApp = {
  orderNumber: string;
  customerName: string;
  totalMinor: number;
  deliveryAddress: string;
  items: { productName: string; quantity: number }[];
};

/**
 * Builds a wa.me deep link that opens a chat with the business, prefilled
 * with an order summary — the "WhatsApp continuation" step after checkout
 * (common for storefronts that finalize delivery details/support over
 * WhatsApp rather than a full in-app messaging system).
 */
export function buildOrderWhatsAppLink(order: OrderForWhatsApp): string {
  const itemLines = order.items.map((i) => `- ${i.quantity}x ${i.productName}`).join("\n");
  const message = [
    `Hi ${config.business.name}, I just placed an order.`,
    ``,
    `Order: ${order.orderNumber}`,
    itemLines,
    ``,
    `Total: ${formatMoney(order.totalMinor)}`,
    `Delivery address: ${order.deliveryAddress}`,
  ].join("\n");

  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${config.business.whatsappNumber}?${params.toString()}`;
}
