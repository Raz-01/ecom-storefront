import { prisma } from "@/lib/prisma";
import { businessConfig } from "@/lib/business.config";

export type DeliveryFeeInput =
  | { fulfillmentMethod: "PICKUP" }
  | { fulfillmentMethod: "DELIVERY"; state: string };

export type DeliveryFeeResult = {
  feeMinor: number;
  /** Null for pickup, or when the state has no explicit `DeliveryZone` row (the default fee applied). */
  deliveryZoneId: string | null;
};

/**
 * Computes the delivery fee for a fulfillment choice. This is the single
 * seam delivery pricing goes through — today it's a flat per-state lookup
 * with a fallback default, but call sites never need to know that; a later
 * phase can make this depend on order weight/package size/quantity without
 * touching checkout or the admin order screens.
 */
export async function computeDeliveryFee(input: DeliveryFeeInput): Promise<DeliveryFeeResult> {
  if (input.fulfillmentMethod === "PICKUP") {
    return { feeMinor: 0, deliveryZoneId: null };
  }

  const zone = await prisma.deliveryZone.findFirst({
    where: { state: { equals: input.state, mode: "insensitive" }, isActive: true },
  });

  if (zone) {
    return { feeMinor: zone.feeMinor, deliveryZoneId: zone.id };
  }
  return { feeMinor: businessConfig.delivery.defaultFeeMinor, deliveryZoneId: null };
}
