import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    neutral: "text-zinc-900 dark:text-zinc-100",
    success: "text-green-700 dark:text-green-400",
    warning: "text-amber-700 dark:text-amber-400",
    danger: "text-red-700 dark:text-red-400",
  } as const;

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
        {icon ? <span className="text-zinc-400">{icon}</span> : null}
      </div>
      <span className={cn("text-2xl font-semibold tracking-tight", toneClasses[tone])}>{value}</span>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </div>
  );
}
