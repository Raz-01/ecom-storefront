"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

/**
 * Cart link with a live item count. Split out from Header so only this
 * small piece needs to be a client component (it's the only part reading
 * the zustand store) — the rest of the header stays server-rendered.
 */
export function CartBadge() {
  // Zustand persists to localStorage and rehydrates after mount, so the
  // count is 0 on the server-rendered/initial-hydration pass and updates
  // right after — avoids a hydration mismatch.
  const count = useCartStore((state) => state.lines.reduce((sum, l) => sum + l.quantity, 0));

  return (
    <Link href="/cart" className="relative flex items-center gap-1.5 text-sm font-medium">
      Cart
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {count}
        </span>
      )}
    </Link>
  );
}
