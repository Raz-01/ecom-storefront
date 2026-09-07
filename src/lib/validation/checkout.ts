import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100_000),
});

/**
 * Loosely validates a Nigerian-style phone number while staying usable for
 * other countries: digits, spaces, "+" and "-" only, 7–20 characters.
 * WhatsApp links re-normalize this into E.164 separately.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^\+?[\d\s-]+$/, "Enter a valid phone number");

const contactFields = {
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  customerPhone: phoneSchema,
  customerWhatsapp: phoneSchema,
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
};

export const checkoutSchema = z.discriminatedUnion("fulfillmentMethod", [
  z.object({
    fulfillmentMethod: z.literal("PICKUP"),
    ...contactFields,
  }),
  z.object({
    fulfillmentMethod: z.literal("DELIVERY"),
    ...contactFields,
    deliveryState: z.string().trim().min(2, "Select a state").max(60),
    deliveryCity: z.string().trim().min(2, "Enter a city").max(60),
    deliveryAddress: z.string().trim().min(5, "Enter a delivery address").max(500),
    deliveryLandmark: z.string().trim().max(200).optional().or(z.literal("")),
  }),
]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const quoteRequestItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(1_000_000),
});

export const quoteRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  customerPhone: phoneSchema,
  customerWhatsapp: phoneSchema,
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  deliveryState: z.string().trim().max(60).optional().or(z.literal("")),
  deliveryCity: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  items: z.array(quoteRequestItemSchema).min(1, "Select at least one product"),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
