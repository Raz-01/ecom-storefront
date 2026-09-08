"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/app/admin/(protected)/products/actions";

export function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleProductActive(productId, !isActive))}
      className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
