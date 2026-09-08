import Link from "next/link";
import { businessConfig } from "@/lib/business.config";
import { cn } from "@/lib/utils/cn";

/**
 * Simple temporary brand mark — a grain-sack silhouette in a rounded
 * badge, easy to reproduce at favicon size and consistent with the
 * category illustrations' line style. Meant to be replaced by a real
 * logo whenever the business commissions one; every other use of the
 * brand name/mark reads from here or `businessConfig`, not hardcoded.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-brand-primary" />
      <path
        d="M12 9h8l2 4-1.5 11a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L10 13Z"
        fill="none"
        className="stroke-white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 9c0-1.7 1.3-2.5 3-2.5S19 7.3 19 9" fill="none" className="stroke-white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <LogoMark className={iconClassName} />
      <span className="text-lg font-semibold tracking-tight text-foreground">{businessConfig.name}</span>
    </Link>
  );
}
