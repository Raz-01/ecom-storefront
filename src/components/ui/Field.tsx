import { forwardRef } from "react";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const fieldControlClasses =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(fieldControlClasses, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldControlClasses, className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(fieldControlClasses, className)} {...props} />;
});

/** Label + control + optional error/hint, the shape every form field in this app uses. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLDivElement> & { label: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
