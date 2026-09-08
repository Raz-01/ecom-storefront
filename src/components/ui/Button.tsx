import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The button system called for in the redesign brief: a green primary
 * action, a light/outlined secondary, a red danger, and a distinct
 * WhatsApp treatment (its own recognizable green, not the brand green —
 * it signals "this opens WhatsApp", not "this is our main action").
 */
const VARIANT_CLASSES = {
  primary: "bg-brand-primary text-white shadow-sm hover:bg-brand-primary-dark disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none",
  outline: "border border-stone-300 bg-white text-stone-900 hover:border-brand-primary hover:text-brand-primary-dark disabled:border-stone-200 disabled:text-stone-400",
  ghost: "text-stone-700 hover:bg-stone-100 disabled:text-stone-400",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:bg-whatsapp-dark",
} as const;

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
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
