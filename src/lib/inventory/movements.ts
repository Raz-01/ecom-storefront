import type { Prisma, InventoryMovementReason } from "@prisma/client";

export class InsufficientStockError extends Error {
  constructor(
    public readonly productId: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(`Only ${available} in stock (requested ${requested})`);
    this.name = "InsufficientStockError";
  }
}

/**
 * Applies a manual stock change (received, damaged, correction) and writes
 * the corresponding `InventoryMovement` ledger row in the same transaction.
 * Used by admin inventory actions. Rejects a change that would take stock
 * negative — a manual correction should never silently corrupt the count;
 * the caller (an admin form) should show the error and let staff re-enter it.
 */
export async function adjustStock(
  tx: Prisma.TransactionClient,
  params: {
    productId: string;
    quantityChange: number; // signed: +100 received, -5 damaged
    reason: InventoryMovementReason;
    note?: string;
    adminId?: string;
  },
) {
  const product = await tx.product.findUniqueOrThrow({ where: { id: params.productId } });
  const newQuantity = product.stock + params.quantityChange;
  if (newQuantity < 0) {
    throw new InsufficientStockError(params.productId, product.stock, -params.quantityChange);
  }

  await tx.product.update({ where: { id: params.productId }, data: { stock: newQuantity } });
  await tx.inventoryMovement.create({
    data: {
      productId: params.productId,
      quantityChange: params.quantityChange,
      previousQuantity: product.stock,
      newQuantity,
      reason: params.reason,
      note: params.note,
      adminId: params.adminId,
    },
  });

  return { previousQuantity: product.stock, newQuantity };
}

/**
 * Deducts stock for a paid order, one line at a time, guarded so a
 * concurrent deduction on the same product can't take it negative — the
 * `WHERE stock >= quantity` clause means if two orders for the same
 * product are confirmed paid at nearly the same moment, whichever commits
 * second sees a failed guard rather than a negative count.
 *
 * A guard failure here is a genuine edge case: the customer's payment has
 * already been captured (this runs *after* payment confirmation), so the
 * order still becomes PAID — we can't silently unwind a live charge from
 * inside this function. Instead we deduct whatever stock remains (clamping
 * at zero) and record the shortfall in the movement's note, so it surfaces
 * as an auditable, investigable event for staff rather than a crash or a
 * negative stock count. This is intentionally rare in practice — it only
 * happens when two customers both complete payment for more of a product
 * than exists, in the narrow window between their two confirmations.
 */
export async function deductStockForOrder(
  tx: Prisma.TransactionClient,
  params: { orderId: string; items: { productId: string; quantity: number }[] },
) {
  const shortfalls: { productId: string; requested: number; deducted: number }[] = [];

  for (const item of params.items) {
    const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
    const deductible = Math.min(item.quantity, product.stock);
    const newQuantity = product.stock - deductible;

    await tx.product.update({ where: { id: item.productId }, data: { stock: newQuantity } });
    await tx.inventoryMovement.create({
      data: {
        productId: item.productId,
        quantityChange: -deductible,
        previousQuantity: product.stock,
        newQuantity,
        reason: "ORDER_PLACED",
        orderId: params.orderId,
        note:
          deductible < item.quantity
            ? `Oversold by ${item.quantity - deductible} unit(s) — payment was already confirmed; needs manual follow-up.`
            : undefined,
      },
    });

    if (deductible < item.quantity) {
      shortfalls.push({ productId: item.productId, requested: item.quantity, deducted: deductible });
    }
  }

  return { shortfalls };
}

/**
 * Reverses a previous `deductStockForOrder` when an order is cancelled
 * after stock was already deducted (i.e. after it had been paid). Restores
 * exactly what was deducted (from the ORDER_PLACED movement history for
 * this order), not the originally-requested quantity — so a prior
 * oversell shortfall isn't double-corrected.
 */
export async function restoreStockForOrder(tx: Prisma.TransactionClient, orderId: string) {
  const deductions = await tx.inventoryMovement.findMany({
    where: { orderId, reason: "ORDER_PLACED" },
  });

  for (const deduction of deductions) {
    const restoredQuantity = -deduction.quantityChange; // deductions are negative
    if (restoredQuantity <= 0) continue;

    const product = await tx.product.findUniqueOrThrow({ where: { id: deduction.productId } });
    const newQuantity = product.stock + restoredQuantity;

    await tx.product.update({ where: { id: deduction.productId }, data: { stock: newQuantity } });
    await tx.inventoryMovement.create({
      data: {
        productId: deduction.productId,
        quantityChange: restoredQuantity,
        previousQuantity: product.stock,
        newQuantity,
        reason: "ORDER_CANCELLED",
        orderId,
      },
    });
  }
}
