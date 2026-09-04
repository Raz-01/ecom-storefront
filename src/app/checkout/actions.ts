"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validation/checkout";
import { createOrder, DeliveryZoneNotFoundError, OrderPricingError } from "@/lib/orders/createOrder";
import { getPaymentProvider } from "@/lib/payments";
import { config } from "@/lib/config";

export type CheckoutFormState = {
  error?: string;
};

/**
 * Creates the order (server-priced, stock-decremented — see `createOrder`)
 * then hands off to the active payment provider and redirects the
 * customer to pay. `redirect()` throws internally, so nothing after a
 * successful `initializeTransaction` call runs — the cart is cleared
 * client-side by the caller before submitting, not here.
 */
export async function submitCheckout(_prevState: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Your cart data is invalid. Please refresh and try again." };
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    deliveryZoneId: formData.get("deliveryZoneId"),
    deliveryAddress: formData.get("deliveryAddress"),
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  let order;
  try {
    order = await createOrder(parsed.data);
  } catch (err) {
    if (err instanceof DeliveryZoneNotFoundError || err instanceof OrderPricingError) {
      return { error: err.message };
    }
    console.error("createOrder failed:", err);
    return { error: "Something went wrong creating your order. Please try again." };
  }

  const provider = getPaymentProvider();
  // Paystack requires an email even though our checkout form treats it as
  // optional (WhatsApp-first businesses often don't collect one) — synthesize
  // a harmless placeholder tied to the order so initialization never fails
  // on a missing field.
  const email = parsed.data.customerEmail || `${order.orderNumber.toLowerCase()}@guest.${new URL(config.appUrl).hostname}`;

  let init;
  try {
    init = await provider.initializeTransaction({
      reference: order.orderNumber,
      amountMinor: order.totalMinor,
      email,
      callbackUrl: `${config.appUrl}/checkout/callback`,
    });
  } catch (err) {
    console.error("initializeTransaction failed:", err);
    return { error: `Order ${order.orderNumber} was created, but we couldn't start payment. Please contact us with this order number.` };
  }

  redirect(init.authorizationUrl);
}
