"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { updateFulfillmentStatus, InvalidStatusTransitionError, type ManualOrderStatus } from "@/lib/orders/updateFulfillmentStatus";

export type UpdateStatusState = { error?: string };

export async function changeOrderStatus(orderNumber: string, _prevState: UpdateStatusState, formData: FormData): Promise<UpdateStatusState> {
  await requirePermission("orders:manage");

  const order = await getOrderByNumber(orderNumber);
  if (!order) return { error: "Order not found" };

  const newStatus = formData.get("status") as ManualOrderStatus;
  try {
    await updateFulfillmentStatus(order.id, newStatus);
  } catch (err) {
    if (err instanceof InvalidStatusTransitionError) return { error: err.message };
    console.error("changeOrderStatus failed:", err);
    return { error: "Something went wrong updating this order." };
  }

  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin/orders");
  return {};
}
