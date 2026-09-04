import { z } from "zod";

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

/**
 * Loosely validates a Nigerian-style phone number while staying usable for
 * other countries: digits, spaces, "+" and "-" only, 7–15 digits total.
 * WhatsApp continuation re-normalizes this into E.164 separately.
 */
export const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^\+?[\d\s-]+$/, "Enter a valid phone number");

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(120),
  customerPhone: phoneSchema,
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  deliveryZoneId: z.string().min(1, "Select a delivery zone"),
  deliveryAddress: z.string().trim().min(5, "Enter a delivery address").max(500),
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
