"use client";

import { useActionState, useState } from "react";
import { submitQuoteRequest, type QuoteFormState } from "@/app/(site)/quote/actions";
import { NIGERIAN_STATES } from "@/lib/nigeria/states";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";

type ProductOption = { id: string; name: string; packageSize: string };
type QuoteLine = { productId: string; quantity: number };

const initialState: QuoteFormState = {};

export function QuoteRequestForm({ products, initialLine }: { products: ProductOption[]; initialLine?: QuoteLine }) {
  const [lines, setLines] = useState<QuoteLine[]>(
    initialLine ? [initialLine] : products[0] ? [{ productId: products[0].id, quantity: 10 }] : [],
  );
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialState);

  const updateLine = (index: number, patch: Partial<QuoteLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };
  const removeLine = (index: number) => setLines((prev) => prev.filter((_, i) => i !== index));
  const addLine = () => products[0] && setLines((prev) => [...prev, { productId: products[0].id, quantity: 10 }]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="items" value={JSON.stringify(lines)} />
      <input type="hidden" name="sameAsPhone" value={sameAsPhone ? "on" : "off"} />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Products</p>
        {lines.map((line, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select value={line.productId} onChange={(e) => updateLine(index, { productId: e.target.value })} className="flex-1">
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.packageSize})
                </option>
              ))}
            </Select>
            <Input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(e) => updateLine(index, { quantity: Math.max(1, Number(e.target.value) || 1) })}
              className="w-24"
              aria-label="Quantity"
            />
            {lines.length > 1 && (
              <button type="button" onClick={() => removeLine(index)} className="text-xs text-stone-500 underline">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addLine} className="self-start text-sm font-medium text-brand-primary-dark underline">
          + Add another product
        </button>
      </div>

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

      <FormField label="Email (optional)" htmlFor="customerEmail">
        <Input id="customerEmail" name="customerEmail" type="email" />
      </FormField>

      <FormField label="Delivery state (optional)" htmlFor="deliveryState">
        <Select id="deliveryState" name="deliveryState" defaultValue="">
          <option value="">Not sure yet</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="City (optional)" htmlFor="deliveryCity">
        <Input id="deliveryCity" name="deliveryCity" maxLength={60} />
      </FormField>

      <FormField label="Anything else we should know? (optional)" htmlFor="message">
        <Textarea id="message" name="message" rows={3} maxLength={2000} />
      </FormField>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={isPending || lines.length === 0}>
        {isPending ? "Sending…" : "Request quote"}
      </Button>
    </form>
  );
}
