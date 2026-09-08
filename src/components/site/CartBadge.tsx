"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

/** Cart link with a live item count. Split out from the header so only this small piece needs to be a client component. */
export function CartBadge() {
  // Zustand persists to localStorage and rehydrates after mount, so the
  // count is 0 on the server-rendered/initial-hydration pass and updates
  // right after — avoids a hydration mismatch.
  const count = useCartStore((state) => state.lines.reduce((sum, l) => sum + l.quantity, 0));

  return (
    <Link href="/cart" className="relative flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-brand-primary-dark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
        <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-xs font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
