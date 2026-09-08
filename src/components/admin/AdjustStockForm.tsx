"use client";

import { useActionState, useState } from "react";
import { adjustProductStock, type AdjustStockState } from "@/app/admin/(protected)/inventory/actions";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: AdjustStockState = {};

const REASON_LABELS: Record<string, string> = {
  STOCK_RECEIVED: "Stock received",
  DAMAGED: "Damaged / written off",
  CORRECTION: "Count correction",
  MANUAL_ADJUSTMENT: "Other adjustment",
};

export function AdjustStockForm({ productId }: { productId: string }) {
  const action = adjustProductStock.bind(null, productId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [direction, setDirection] = useState<"add" | "remove">("add");

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex rounded-md border border-stone-300">
        <button type="button" onClick={() => setDirection("add")} className={`px-2 py-1.5 text-xs font-medium ${direction === "add" ? "bg-green-100 text-green-800" : ""}`}>
          Add
        </button>
        <button type="button" onClick={() => setDirection("remove")} className={`px-2 py-1.5 text-xs font-medium ${direction === "remove" ? "bg-red-100 text-red-800" : ""}`}>
          Remove
        </button>
      </div>
      <input type="hidden" name="direction" value={direction} />
      <Input type="number" name="amount" min={1} required placeholder="Qty" className="w-20" />
      <Select name="reason" required defaultValue="" className="w-40">
        <option value="" disabled>
          Reason
        </option>
        {Object.entries(REASON_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input name="note" placeholder="Note (optional)" className="w-40" />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving…" : "Apply"}
      </Button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
