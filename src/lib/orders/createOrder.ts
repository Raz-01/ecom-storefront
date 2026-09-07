import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveUnitPrice } from "@/lib/catalog/pricing";
import { computeDeliveryFee } from "@/lib/delivery";
import { withUniqueReferenceRetry } from "@/lib/orders/referenceCode";
import type { CheckoutInput } from "@/lib/validation/checkout";

export class OrderPricingError extends Error {
  constructor(
    message: string,
    /** Machine-readable reason, useful for mapping to a user-facing message. */
    public readonly code:
      | "PRODUCT_UNAVAILABLE"
      | "PRODUCT_NOT_FOUND"
      | "INSUFFICIENT_STOCK"
      | "BELOW_MIN_ORDER_QUANTITY"
      | "QUOTE_REQUIRED",
    public readonly productId?: string,
  ) {
    super(message);
    this.name = "OrderPricingError";
  }
}

/**
 * Creates a PENDING_PAYMENT order from a checkout submission. Pricing
 * (including any bulk-price tier) and the delivery fee are entirely
 * recomputed here from the database — the client only ever supplies
 * product IDs and quantities, so a tampered request can't affect what's
 * actually charged.
 *
 * Deliberately does NOT touch stock. The out-of-stock check below is a
 * soft, point-in-time check for fast feedback ("only 3 left") — it is not
 * a reservation. Inventory is only actually deducted once payment is
 * confirmed (see `lib/inventory/movements.ts` + `confirmPayment.ts`), with
 * its own guard against overselling at that point. This is the business
 * rule from the project brief: an order existing must never hold stock
 * hostage from an abandoned checkout.
 */
export async function createOrder(input: CheckoutInput): Promise<Order> {
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { bulkPrices: true },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const lines = input.items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      throw new OrderPricingError(`Product ${item.productId} not found`, "PRODUCT_NOT_FOUND", item.productId);
    }
    if (!product.isActive) {
      throw new OrderPricingError(`${product.name} is no longer available`, "PRODUCT_UNAVAILABLE", product.id);
    }
    if (item.quantity < product.minOrderQuantity) {
      throw new OrderPricingError(
        `Minimum order for ${product.name} is ${product.minOrderQuantity} ${product.packageSize}`,
        "BELOW_MIN_ORDER_QUANTITY",
        product.id,
      );
    }
    if (product.stock < item.quantity) {
      throw new OrderPricingError(`Only ${product.stock} of ${product.name} in stock`, "INSUFFICIENT_STOCK", product.id);
    }

    const resolution = resolveUnitPrice(product, item.quantity);
    if (resolution.kind === "quote_required") {
      throw new OrderPricingError(
        `${product.name} at this quantity needs a custom quote — use "Request Bulk Quote" instead of checkout`,
        "QUOTE_REQUIRED",
        product.id,
      );
    }

    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      packageSize: product.packageSize,
      unitPriceMinor: resolution.unitPriceMinor,
      quantity: item.quantity,
      lineTotalMinor: resolution.unitPriceMinor * item.quantity,
    };
  });

  const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);

  const delivery =
    input.fulfillmentMethod === "DELIVERY"
      ? await computeDeliveryFee({ fulfillmentMethod: "DELIVERY", state: input.deliveryState })
      : await computeDeliveryFee({ fulfillmentMethod: "PICKUP" });

  const totalMinor = subtotalMinor + delivery.feeMinor;

  return withUniqueReferenceRetry(
    (orderNumber) =>
      prisma.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerWhatsapp: input.customerWhatsapp,
          customerEmail: input.customerEmail || null,
          fulfillmentMethod: input.fulfillmentMethod,
          deliveryZoneId: delivery.deliveryZoneId,
          deliveryState: input.fulfillmentMethod === "DELIVERY" ? input.deliveryState : null,
          deliveryCity: input.fulfillmentMethod === "DELIVERY" ? input.deliveryCity : null,
          deliveryAddress: input.fulfillmentMethod === "DELIVERY" ? input.deliveryAddress : null,
          deliveryLandmark: input.fulfillmentMethod === "DELIVERY" ? input.deliveryLandmark || null : null,
          deliveryFeeMinor: delivery.feeMinor,
          subtotalMinor,
          totalMinor,
          status: "PENDING_PAYMENT",
          items: { create: lines },
        },
      }),
    "orderNumber",
  );
}
