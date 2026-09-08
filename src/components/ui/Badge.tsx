import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const TONE_CLASSES = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
  brand: "bg-brand-primary/10 text-brand-primary-dark dark:text-brand-primary",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof TONE_CLASSES;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
