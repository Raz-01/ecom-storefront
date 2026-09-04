"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { getCartDisplay } from "@/lib/cart/getCartDisplay";
import { formatMoney } from "@/lib/currency";
import type { CartLineDisplay } from "@/types/domain";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // null = "haven't loaded yet" (covers both the pre-hydration SSR pass and
  // the in-flight fetch), distinct from [] which is a genuinely empty cart.
  const [display, setDisplay] = useState<CartLineDisplay[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCartDisplay(lines).then((result) => {
      if (!cancelled) setDisplay(result);
    });
    return () => {
      cancelled = true;
    };
  }, [lines]);

  if (display === null) {
    return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6" />;
  }

  if (display.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link href="/" className="text-sm font-medium underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  const subtotalMinor = display.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
  const hasBlockingIssue = display.some((line) => !line.isActive || line.stock < line.quantity);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold">Your cart</h1>
      <ul className="flex flex-col gap-4">
        {display.map((line) => {
          const unavailable = !line.isActive;
          const insufficientStock = line.isActive && line.stock < line.quantity;
          return (
            <li key={line.productId} className="flex gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-900">
                {line.imageUrl ? (
                  <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="rounded-md object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/products/${line.slug}`} className="text-sm font-medium hover:underline">
                  {line.name}
                </Link>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{formatMoney(line.unitPriceMinor)}</span>
                {unavailable && <span className="text-xs text-red-600 dark:text-red-400">No longer available — remove to continue</span>}
                {insufficientStock && (
                  <span className="text-xs text-red-600 dark:text-red-400">Only {line.stock} left — reduce quantity to continue</span>
                )}
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="px-2.5 py-1 text-base leading-none"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="px-2.5 py-1 text-base leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(line.productId)} className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">
                    Remove
                  </button>
                </div>
              </div>
              <span className="text-sm font-medium">{formatMoney(line.unitPriceMinor * line.quantity)}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col items-end gap-4">
        <div className="flex w-full justify-between text-base font-semibold sm:w-64">
          <span>Subtotal</span>
          <span>{formatMoney(subtotalMinor)}</span>
        </div>
        <p className="text-xs text-zinc-500">Delivery fee is calculated at checkout based on your delivery zone.</p>
        {hasBlockingIssue ? (
          <p className="text-sm text-red-600 dark:text-red-400">Resolve the issues above before checking out.</p>
        ) : (
          <Link
            href="/checkout"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Checkout
          </Link>
        )}
      </div>
    </main>
  );
}
