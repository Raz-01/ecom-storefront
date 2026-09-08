"use client";

import { useTransition } from "react";
import { toggleStaffActive } from "@/app/admin/(protected)/staff/actions";

export function ToggleStaffActiveButton({ staffId, isActive, disabled }: { staffId: string; isActive: boolean; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => startTransition(() => toggleStaffActive(staffId, !isActive))}
      className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
