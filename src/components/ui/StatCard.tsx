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
    neutral: "text-stone-900",
    success: "text-green-700",
    warning: "text-amber-700",
    danger: "text-red-700",
  } as const;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</span>
        {icon ? <span className="text-stone-400">{icon}</span> : null}
      </div>
      <span className={cn("text-2xl font-semibold tracking-tight", toneClasses[tone])}>{value}</span>
      {hint ? <span className="text-xs text-stone-500">{hint}</span> : null}
    </div>
  );
}
