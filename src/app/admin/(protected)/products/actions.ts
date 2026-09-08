"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { toMinorUnits } from "@/lib/currency";
import { productFormSchema, newProductFormSchema } from "@/lib/validation/product";
import { adjustStock } from "@/lib/inventory/movements";
import type { PackageType } from "@prisma/client";

export type ProductFormState = { error?: string };

function parseCommonFields(formData: FormData) {
  let bulkPrices: unknown = [];
  try {
    bulkPrices = JSON.parse(String(formData.get("bulkPrices") ?? "[]"));
  } catch {
    // leave as [] — schema validation below will pass through an empty array either way
  }

  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    brand: formData.get("brand"),
    categoryId: formData.get("categoryId"),
    packageType: formData.get("packageType"),
    packageSize: formData.get("packageSize"),
    priceMinor: toMinorUnits(Number(formData.get("priceMajor") || 0)),
    lowStockThreshold: Number(formData.get("lowStockThreshold") || 0),
    minOrderQuantity: Number(formData.get("minOrderQuantity") || 1),
    bulkQuoteThreshold: formData.get("bulkQuoteThreshold") ? Number(formData.get("bulkQuoteThreshold")) : undefined,
    imageUrl: formData.get("imageUrl"),
    isFeatured: formData.get("isFeatured") === "on",
    bulkPrices: (Array.isArray(bulkPrices) ? bulkPrices : []).map((t: { minQuantity: number; priceMajor: number }) => ({
      minQuantity: Number(t.minQuantity),
      pricePerUnitMinor: toMinorUnits(Number(t.priceMajor)),
    })),
  };
}

export async function createProduct(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requirePermission("products:manage");

  const raw = { ...parseCommonFields(formData), initialStock: Number(formData.get("initialStock") || 0) };
  const parsed = newProductFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  try {
    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) return { error: "A product with this slug already exists." };
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) return { error: "A product with this SKU already exists." };

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description,
          brand: data.brand || null,
          categoryId: data.categoryId,
          packageType: data.packageType as PackageType,
          packageSize: data.packageSize,
          priceMinor: data.priceMinor,
          lowStockThreshold: data.lowStockThreshold,
          minOrderQuantity: data.minOrderQuantity,
          bulkQuoteThreshold: data.bulkQuoteThreshold ?? null,
          imageUrl: data.imageUrl || null,
          isFeatured: data.isFeatured,
          stock: 0,
          bulkPrices: { create: data.bulkPrices },
        },
      });
      if (data.initialStock > 0) {
        await adjustStock(tx, { productId: created.id, quantityChange: data.initialStock, reason: "STOCK_RECEIVED", note: "Initial stock at product creation" });
      }
      return created;
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    redirect(`/admin/products/${product.id}`);
  } catch (err) {
    console.error("createProduct failed:", err);
    return { error: "Something went wrong creating the product." };
  }
}

export async function updateProduct(productId: string, _prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requirePermission("products:manage");

  const raw = parseCommonFields(formData);
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  try {
    const conflictingSlug = await prisma.product.findFirst({ where: { slug: data.slug, NOT: { id: productId } } });
    if (conflictingSlug) return { error: "A product with this slug already exists." };
    const conflictingSku = await prisma.product.findFirst({ where: { sku: data.sku, NOT: { id: productId } } });
    if (conflictingSku) return { error: "A product with this SKU already exists." };

    await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUniqueOrThrow({ where: { id: productId } });

      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description,
          brand: data.brand || null,
          categoryId: data.categoryId,
          packageType: data.packageType as PackageType,
          packageSize: data.packageSize,
          // A price change is never retroactive: past orders keep the price
          // actually charged via their own OrderItem snapshot fields, never
          // recomputed from the current product price. `previousPriceMinor`
          // just remembers the prior price for display (e.g. "was ₦X").
          ...(data.priceMinor !== current.priceMinor ? { previousPriceMinor: current.priceMinor } : {}),
          priceMinor: data.priceMinor,
          lowStockThreshold: data.lowStockThreshold,
          minOrderQuantity: data.minOrderQuantity,
          bulkQuoteThreshold: data.bulkQuoteThreshold ?? null,
          imageUrl: data.imageUrl || null,
          isFeatured: data.isFeatured,
        },
      });
      await tx.bulkPrice.deleteMany({ where: { productId } });
      if (data.bulkPrices.length > 0) {
        await tx.bulkPrice.createMany({ data: data.bulkPrices.map((t) => ({ ...t, productId })) });
      }
    });
  } catch (err) {
    console.error("updateProduct failed:", err);
    return { error: "Something went wrong saving the product." };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function toggleProductActive(productId: string, isActive: boolean): Promise<void> {
  await requirePermission("products:manage");
  await prisma.product.update({ where: { id: productId }, data: { isActive } });
  revalidatePath("/admin/products");
}
