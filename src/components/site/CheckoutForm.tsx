"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { getCartDisplay, type CartLineDisplay } from "@/lib/cart/getCartDisplay";
import { previewDeliveryFee } from "@/lib/delivery/previewDeliveryFee";
import { formatMoney } from "@/lib/currency";
import { NIGERIAN_STATES } from "@/lib/nigeria/states";
import { submitCheckout, type CheckoutFormState } from "@/app/(site)/checkout/actions";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

const initialState: CheckoutFormState = {};

export function CheckoutForm() {
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const [display, setDisplay] = useState<CartLineDisplay[] | null>(null);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryState, setDeliveryState] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  // Only meaningful once fetched for fulfillmentMethod === "DELIVERY" with a
  // state selected — the PICKUP/no-state cases are ₦0 and derived directly
  // below rather than round-tripped through state + an effect.
  const [deliveryFeePreview, setDeliveryFeePreview] = useState(0);
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

  useEffect(() => {
    if (fulfillmentMethod !== "DELIVERY" || !deliveryState) return;
    let cancelled = false;
    previewDeliveryFee({ fulfillmentMethod: "DELIVERY", state: deliveryState }).then((result) => {
      if (!cancelled) setDeliveryFeePreview(result.feeMinor);
    });
    return () => {
      cancelled = true;
    };
  }, [fulfillmentMethod, deliveryState]);

  const deliveryFeeMinor = fulfillmentMethod === "DELIVERY" && deliveryState ? deliveryFeePreview : 0;

  if (display === null) {
    return <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6" />;
  }

  if (display.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <Link href="/shop" className="text-sm font-medium text-brand-primary-dark underline dark:text-brand-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  const lineTotal = (line: CartLineDisplay) => (line.priceResolution.kind === "priced" ? line.priceResolution.unitPriceMinor * line.quantity : 0);
  const subtotalMinor = display.reduce((sum, line) => sum + lineTotal(line), 0);
  const totalMinor = subtotalMinor + deliveryFeeMinor;
  const hasBlockingIssue = display.some(
    (line) => !line.isActive || line.stock < line.quantity || line.quantity < line.minOrderQuantity || line.priceResolution.kind === "quote_required",
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row-reverse">
      <aside className="flex-shrink-0 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 md:w-80">
        <h2 className="mb-3 text-sm font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {display.map((line) => (
            <li key={line.productId} className="flex justify-between gap-2 text-zinc-600 dark:text-zinc-400">
              <span>
                {line.quantity}× {line.name} <span className="text-xs">({line.packageSize})</span>
                {line.priceResolution.kind === "priced" && line.priceResolution.appliedTier && <Badge tone="brand" className="ml-1">Bulk</Badge>}
              </span>
              <span className="flex-shrink-0">{formatMoney(lineTotal(line))}</span>
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
            <span>{fulfillmentMethod === "PICKUP" ? "Free (pickup)" : deliveryState ? formatMoney(deliveryFeeMinor) : "—"}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(totalMinor)}</span>
          </div>
        </div>
      </aside>

      <form action={formAction} onSubmit={() => clearCart()} className="flex flex-1 flex-col gap-4">
        <input type="hidden" name="items" value={JSON.stringify(lines)} />
        <input type="hidden" name="fulfillmentMethod" value={fulfillmentMethod} />

        <fieldset className="flex gap-2">
          <legend className="mb-1 text-sm font-medium">How would you like to get your order?</legend>
          {(["PICKUP", "DELIVERY"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setFulfillmentMethod(method)}
              className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium ${
                fulfillmentMethod === method
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary-dark dark:text-brand-primary"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {method === "PICKUP" ? "Pickup from warehouse" : "Delivery"}
            </button>
          ))}
        </fieldset>

        <FormField label="Full name" htmlFor="customerName">
          <Input id="customerName" name="customerName" required minLength={2} maxLength={120} />
        </FormField>

        <FormField label="Phone number" htmlFor="customerPhone">
          <Input id="customerPhone" name="customerPhone" type="tel" required placeholder="080..." />
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} />
          WhatsApp number is the same as my phone number
        </label>
        {!sameAsPhone && (
          <FormField label="WhatsApp number" htmlFor="customerWhatsapp">
            <Input id="customerWhatsapp" name="customerWhatsapp" type="tel" required placeholder="080..." />
          </FormField>
        )}
        <input type="hidden" name="sameAsPhone" value={sameAsPhone ? "on" : "off"} />

        <FormField label="Email (optional)" htmlFor="customerEmail">
          <Input id="customerEmail" name="customerEmail" type="email" />
        </FormField>

        {fulfillmentMethod === "DELIVERY" && (
          <>
            <FormField label="State" htmlFor="deliveryState">
              <Select id="deliveryState" name="deliveryState" required value={deliveryState} onChange={(e) => setDeliveryState(e.target.value)}>
                <option value="">Select a state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="City" htmlFor="deliveryCity">
              <Input id="deliveryCity" name="deliveryCity" required minLength={2} maxLength={60} />
            </FormField>
            <FormField label="Delivery address" htmlFor="deliveryAddress">
              <Textarea id="deliveryAddress" name="deliveryAddress" required minLength={5} maxLength={500} rows={3} />
            </FormField>
            <FormField label="Landmark (optional)" htmlFor="deliveryLandmark">
              <Input id="deliveryLandmark" name="deliveryLandmark" maxLength={200} />
            </FormField>
          </>
        )}

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <Button type="submit" size="lg" disabled={isPending || hasBlockingIssue}>
          {isPending ? "Placing order…" : `Pay ${formatMoney(totalMinor)}`}
        </Button>
        {hasBlockingIssue && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Some items in your cart need attention —{" "}
            <Link href="/cart" className="underline">
              go back to your cart
            </Link>{" "}
            to fix them.
          </p>
        )}
      </form>
    </div>
  );
}
