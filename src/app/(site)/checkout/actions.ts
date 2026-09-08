"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/validation/checkout";
import { createOrder, OrderPricingError } from "@/lib/orders/createOrder";
import { initiatePayment } from "@/lib/orders/initiatePayment";
import { serverEnv } from "@/lib/env.server";

export type CheckoutFormState = { error?: string };

/**
 * Creates the order (server-priced, stock validated but NOT decremented —
 * see `createOrder`) then hands off to the active payment provider and
 * redirects the customer to pay. `redirect()` throws internally, so
 * nothing after a successful `initiatePayment` call runs — the cart is
 * cleared client-side by the caller before submitting, not here.
 */
export async function submitCheckout(_prevState: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Your cart data is invalid. Please refresh and try again." };
  }

  const fulfillmentMethod = formData.get("fulfillmentMethod");
  const raw = {
    fulfillmentMethod,
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerWhatsapp: formData.get("sameAsPhone") === "on" ? formData.get("customerPhone") : formData.get("customerWhatsapp"),
    customerEmail: formData.get("customerEmail"),
    items,
    ...(fulfillmentMethod === "DELIVERY"
      ? {
          deliveryState: formData.get("deliveryState"),
          deliveryCity: formData.get("deliveryCity"),
          deliveryAddress: formData.get("deliveryAddress"),
          deliveryLandmark: formData.get("deliveryLandmark"),
        }
      : {}),
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  let order;
  try {
    order = await createOrder(parsed.data);
  } catch (err) {
    if (err instanceof OrderPricingError) {
      return { error: err.message };
    }
    console.error("createOrder failed:", err);
    return { error: "Something went wrong creating your order. Please try again." };
  }

  // Paystack requires an email even though our checkout form treats it as
  // optional — synthesize a harmless placeholder tied to the order so
  // payment initialization never fails on a missing field.
  const email = parsed.data.customerEmail || `${order.orderNumber.toLowerCase()}@guest.${new URL(serverEnv.appUrl).hostname}`;

  let init;
  try {
    init = await initiatePayment(order, email);
  } catch (err) {
    console.error("initiatePayment failed:", err);
    return {
      error: `Order ${order.orderNumber} was created, but we couldn't start payment. Please contact us on WhatsApp with this order number.`,
    };
  }

  redirect(init.authorizationUrl);
}
