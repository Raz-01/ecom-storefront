"use server";

import { computeDeliveryFee, type DeliveryFeeInput } from "@/lib/delivery";

/** Client-callable wrapper around `computeDeliveryFee`, so the checkout form can show an accurate fee as soon as a state is picked, before the order is actually created. */
export async function previewDeliveryFee(input: DeliveryFeeInput) {
  return computeDeliveryFee(input);
}
