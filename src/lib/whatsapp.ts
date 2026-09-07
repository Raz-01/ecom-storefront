import { businessConfig } from "@/lib/business.config";
import { formatMoney } from "@/lib/currency";

/**
 * Single source of truth for wa.me link generation — used from the header,
 * product pages, quote requests, checkout, order confirmation, and the
 * admin order/quote screens. Never build a wa.me URL by hand elsewhere.
 */
export function buildWhatsAppLink(phoneDigitsIntl: string, message: string): string {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${phoneDigitsIntl}?${params.toString()}`;
}

/** Strips everything but digits, for turning a loosely-formatted phone number into wa.me's expected international-digits-only form. */
export function toWhatsAppDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

type OrderForWhatsApp = {
  orderNumber: string;
  totalMinor: number;
  fulfillmentMethod: "PICKUP" | "DELIVERY";
  deliveryAddress: string | null;
  items: { productName: string; quantity: number; packageSize: string }[];
};

/** A link that opens a chat with the business (customer → business), prefilled with an order summary — the checkout/confirmation "continue on WhatsApp" step. */
export function buildOrderWhatsAppLink(order: OrderForWhatsApp): string {
  const itemLines = order.items.map((i) => `- ${i.quantity}x ${i.productName} (${i.packageSize})`).join("\n");
  const message = [
    `Hello, I just placed an order with ${businessConfig.name}.`,
    ``,
    `Order: #${order.orderNumber}`,
    itemLines,
    ``,
    `Total: ${formatMoney(order.totalMinor)}`,
    order.fulfillmentMethod === "DELIVERY" && order.deliveryAddress
      ? `Delivery address: ${order.deliveryAddress}`
      : `Fulfillment: Pickup from the warehouse`,
    ``,
    `I'd like to confirm the next steps for my order.`,
  ].join("\n");

  return buildWhatsAppLink(businessConfig.contact.whatsapp, message);
}

type QuoteForWhatsApp = {
  quoteNumber: string;
  deliveryState: string | null;
  message: string | null;
  items: { productName: string; quantity: number }[];
};

/** A link that opens a chat with the business (customer → business), prefilled with a bulk quote request. */
export function buildQuoteWhatsAppLink(quote: QuoteForWhatsApp): string {
  const itemLines = quote.items.map((i) => `- ${i.quantity}x ${i.productName}`).join("\n");
  const lines = [
    `Hello, I'd like a bulk quote from ${businessConfig.name}.`,
    ``,
    `Quote reference: #${quote.quoteNumber}`,
    itemLines,
  ];
  if (quote.deliveryState) lines.push(``, `Delivery location: ${quote.deliveryState}`);
  if (quote.message) lines.push(``, `Note: ${quote.message}`);

  return buildWhatsAppLink(businessConfig.contact.whatsapp, lines.join("\n"));
}

/** A link that opens a chat with a *customer* (business → customer) — used from the admin order/quote screens. */
export function buildCustomerContactWhatsAppLink(customerWhatsapp: string, message: string): string {
  return buildWhatsAppLink(toWhatsAppDigits(customerWhatsapp), message);
}
