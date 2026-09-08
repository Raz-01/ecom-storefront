"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { getCartDisplay, type CartLineDisplay } from "@/lib/cart/getCartDisplay";
import { formatMoney } from "@/lib/currency";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

function lineIssue(line: CartLineDisplay): string | null {
  if (!line.isActive) return "No longer available — remove to continue";
  if (line.stock < line.quantity) return `Only ${line.stock} left — reduce quantity to continue`;
  if (line.quantity < line.minOrderQuantity) return `Minimum order is ${line.minOrderQuantity}`;
  if (line.priceResolution.kind === "quote_required") return "This quantity needs a custom quote — request one instead of checking out";
  return null;
}

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

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
        <Link href="/shop" className="text-sm font-medium text-brand-primary-dark underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  const lineTotal = (line: CartLineDisplay) =>
    line.priceResolution.kind === "priced" ? line.priceResolution.unitPriceMinor * line.quantity : 0;
  const subtotalMinor = display.reduce((sum, line) => sum + lineTotal(line), 0);
  const hasBlockingIssue = display.some((line) => lineIssue(line) !== null);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Your cart</h1>
      <Card className="p-4 sm:p-5">
      <ul className="flex flex-col divide-y divide-stone-100">
        {display.map((line) => {
          const issue = lineIssue(line);
          const unitPrice = line.priceResolution.kind === "priced" ? line.priceResolution.unitPriceMinor : null;
          const appliedTier = line.priceResolution.kind === "priced" ? line.priceResolution.appliedTier : null;

          return (
            <li key={line.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-stone-100">
                {line.imageUrl ? <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="rounded-md object-cover" /> : null}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Link href={`/shop/product/${line.slug}`} className="text-sm font-medium hover:underline">
                  {line.name}
                </Link>
                <span className="text-xs text-stone-500">{line.packageSize}</span>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  {unitPrice !== null ? formatMoney(unitPrice) : "Quote required"}
                  {appliedTier && <Badge tone="brand">Bulk price</Badge>}
                </div>
                {issue && <span className="text-xs text-red-600">{issue}</span>}
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-stone-300">
                    <button type="button" onClick={() => setQuantity(line.productId, line.quantity - 1)} className="px-2.5 py-1 text-base leading-none" aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">{line.quantity}</span>
                    <button type="button" onClick={() => setQuantity(line.productId, line.quantity + 1)} className="px-2.5 py-1 text-base leading-none" aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(line.productId)} className="text-xs text-stone-500 underline hover:text-stone-700">
                    Remove
                  </button>
                </div>
              </div>
              <span className="text-sm font-medium">{unitPrice !== null ? formatMoney(lineTotal(line)) : "—"}</span>
            </li>
          );
        })}
      </ul>
      </Card>

      <div className="mt-4 flex flex-col items-end gap-4 rounded-xl border border-stone-200 bg-surface p-4 shadow-sm sm:p-5">
        <div className="flex w-full justify-between text-base font-semibold text-foreground sm:w-64">
          <span>Subtotal</span>
          <span>{formatMoney(subtotalMinor)}</span>
        </div>
        <p className="text-xs text-stone-500">Delivery fee is calculated at checkout based on your state.</p>
        {hasBlockingIssue ? (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-red-600">Resolve the issues above before checking out.</p>
            <Link href="/quote" className="text-sm font-medium text-brand-primary-dark underline">
              Request a bulk quote instead
            </Link>
          </div>
        ) : (
          <Link href="/checkout" className={buttonClasses("primary", "lg")}>
            Checkout
          </Link>
        )}
      </div>
    </main>
  );
}
