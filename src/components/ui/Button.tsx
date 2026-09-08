import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const VARIANT_CLASSES = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-dark disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-700 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600",
  outline:
    "border border-zinc-300 text-zinc-900 hover:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900",
  ghost: "text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-900",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400",
  whatsapp: "bg-green-600 text-white hover:bg-green-700",
} as const;

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-sm",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

/** The class string a `<button>` gets — exported so a `<Link>` (checkout CTAs, "View product" etc.) can look identical without needing an `asChild` polymorphism layer. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />;
});
