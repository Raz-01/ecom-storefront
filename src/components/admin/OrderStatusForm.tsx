"use client";

import { useActionState } from "react";
import { changeOrderStatus, type UpdateStatusState } from "@/app/admin/(protected)/orders/[orderNumber]/actions";
import { MANUAL_ORDER_STATUSES } from "@/lib/orders/updateFulfillmentStatus";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: UpdateStatusState = {};

export function OrderStatusForm({ orderNumber, currentStatus }: { orderNumber: string; currentStatus: string }) {
  const action = changeOrderStatus.bind(null, orderNumber);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Select name="status" defaultValue={currentStatus} className="w-48">
        {MANUAL_ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Updating…" : "Update status"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
