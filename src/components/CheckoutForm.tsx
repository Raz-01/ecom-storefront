"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { getCartDisplay } from "@/lib/cart/getCartDisplay";
import { formatMoney } from "@/lib/currency";
import { submitCheckout, type CheckoutFormState } from "@/app/checkout/actions";
import type { CartLineDisplay } from "@/types/domain";

type DeliveryZoneOption = { id: string; name: string; feeMinor: number };

const initialState: CheckoutFormState = {};

export function CheckoutForm({ deliveryZones }: { deliveryZones: DeliveryZoneOption[] }) {
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const [display, setDisplay] = useState<CartLineDisplay[] | null>(null);
  const [zoneId, setZoneId] = useState(deliveryZones[0]?.id ?? "");
  const [state, formAction, isPending] = useActionState(submitCheckout, initialState);

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
    return <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6" />;
  }

  if (display.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link href="/" className="text-sm font-medium underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotalMinor = display.reduce((sum, line) => sum + line.unitPriceMinor * line.quantity, 0);
  const selectedZone = deliveryZones.find((z) => z.id === zoneId);
  const deliveryFeeMinor = selectedZone?.feeMinor ?? 0;
  const totalMinor = subtotalMinor + deliveryFeeMinor;
  const hasBlockingIssue = display.some((line) => !line.isActive || line.stock < line.quantity);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row-reverse">
      <aside className="flex-shrink-0 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 md:w-72">
        <h2 className="mb-3 text-sm font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {display.map((line) => (
            <li key={line.productId} className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>
                {line.quantity}× {line.name}
              </span>
              <span>{formatMoney(line.unitPriceMinor * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalMinor)}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Delivery</span>
            <span>{selectedZone ? formatMoney(deliveryFeeMinor) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(totalMinor)}</span>
          </div>
        </div>
      </aside>

      <form action={formAction} onSubmit={() => clearCart()} className="flex flex-1 flex-col gap-4">
        <input type="hidden" name="items" value={JSON.stringify(lines)} />

        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input name="customerName" required minLength={2} maxLength={120} className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Phone number
          <input name="customerPhone" type="tel" required placeholder="080..." className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email (optional)
          <input name="customerEmail" type="email" className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Delivery zone</legend>
          {deliveryZones.map((zone) => (
            <label key={zone.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700">
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deliveryZoneId"
                  value={zone.id}
                  checked={zoneId === zone.id}
                  onChange={() => setZoneId(zone.id)}
                  required
                />
                {zone.name}
              </span>
              <span className="text-zinc-500">{formatMoney(zone.feeMinor)}</span>
            </label>
          ))}
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          Delivery address
          <textarea name="deliveryAddress" required minLength={5} maxLength={500} rows={3} className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900" />
        </label>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending || hasBlockingIssue}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isPending ? "Placing order…" : `Pay ${formatMoney(totalMinor)}`}
        </button>
        {hasBlockingIssue && <p className="text-sm text-red-600 dark:text-red-400">Some items in your cart need attention — go back to your cart to fix them.</p>}
      </form>
    </div>
  );
}
