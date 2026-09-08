import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional Tailwind classes without conflicting utilities piling up (e.g. two different `px-*`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
