"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { adjustStock, InsufficientStockError } from "@/lib/inventory/movements";
import type { InventoryMovementReason } from "@prisma/client";

export type AdjustStockState = { error?: string; success?: boolean };

const MANUAL_REASONS: InventoryMovementReason[] = ["STOCK_RECEIVED", "DAMAGED", "CORRECTION", "MANUAL_ADJUSTMENT"];

export async function adjustProductStock(productId: string, _prevState: AdjustStockState, formData: FormData): Promise<AdjustStockState> {
  const session = await requirePermission("inventory:manage");

  const direction = formData.get("direction") === "remove" ? -1 : 1;
  const amount = Number(formData.get("amount"));
  const reason = formData.get("reason") as InventoryMovementReason;
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!Number.isInteger(amount) || amount <= 0) {
    return { error: "Enter a whole number greater than zero." };
  }
  if (!MANUAL_REASONS.includes(reason)) {
    return { error: "Select a valid reason." };
  }

  try {
    await prisma.$transaction((tx) =>
      adjustStock(tx, { productId, quantityChange: direction * amount, reason, note, adminId: session.user.id }),
    );
  } catch (err) {
    if (err instanceof InsufficientStockError) return { error: err.message };
    console.error("adjustProductStock failed:", err);
    return { error: "Something went wrong adjusting stock." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin");
  return { success: true };
}
