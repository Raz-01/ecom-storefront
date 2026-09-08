"use client";

import { useActionState } from "react";
import { updateQuote, type UpdateQuoteState } from "@/app/admin/(protected)/quotes/actions";
import { Select, Textarea, FormField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "ACCEPTED", "REJECTED", "EXPIRED"] as const;
const initialState: UpdateQuoteState = {};

export function QuoteUpdateForm({ quoteNumber, currentStatus, currentNotes }: { quoteNumber: string; currentStatus: string; currentNotes: string }) {
  const action = updateQuote.bind(null, quoteNumber);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={currentStatus}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Notes" htmlFor="adminNotes">
        <Textarea id="adminNotes" name="adminNotes" rows={3} defaultValue={currentNotes} placeholder="What was agreed, next steps, etc." />
      </FormField>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" size="sm" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
