import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const bulkPriceTierSchema = z.object({
  minQuantity: z.number().int().positive(),
  pricePerUnitMinor: z.number().int().positive(),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().toLowerCase().regex(slugPattern, "Use lowercase letters, numbers and hyphens only"),
  sku: z.string().trim().min(2).max(60),
  description: z.string().trim().min(5).max(2000),
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Select a category"),
  packageType: z.enum(["BAG", "CARTON", "BOTTLE", "PACK", "SACK", "BOX"]),
  packageSize: z.string().trim().min(1).max(60),
  priceMinor: z.number().int().positive(),
  lowStockThreshold: z.number().int().min(0),
  minOrderQuantity: z.number().int().positive(),
  bulkQuoteThreshold: z.number().int().positive().optional(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  isFeatured: z.boolean(),
  bulkPrices: z.array(bulkPriceTierSchema),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

/** Create-only: initial stock, since a brand-new product has no movement history to reconcile against. */
export const newProductFormSchema = productFormSchema.extend({
  initialStock: z.number().int().min(0),
});
