import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const TONE_CLASSES = {
  neutral: "bg-stone-100 text-stone-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  brand: "bg-brand-primary/10 text-brand-primary-dark",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof TONE_CLASSES;
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
