"use server";

import { redirect } from "next/navigation";
import { quoteRequestSchema } from "@/lib/validation/checkout";
import { createQuoteRequest } from "@/lib/quotes/createQuoteRequest";

export type QuoteFormState = { error?: string };

export async function submitQuoteRequest(_prevState: QuoteFormState, formData: FormData): Promise<QuoteFormState> {
  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Your product selection is invalid. Please try again." };
  }

  const parsed = quoteRequestSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerWhatsapp: formData.get("sameAsPhone") === "on" ? formData.get("customerPhone") : formData.get("customerWhatsapp"),
    customerEmail: formData.get("customerEmail"),
    deliveryState: formData.get("deliveryState"),
    deliveryCity: formData.get("deliveryCity"),
    message: formData.get("message"),
    items,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  let quote;
  try {
    quote = await createQuoteRequest(parsed.data);
  } catch (err) {
    console.error("createQuoteRequest failed:", err);
    return { error: "Something went wrong submitting your request. Please try again or reach us on WhatsApp." };
  }

  redirect(`/quote/${quote.quoteNumber}`);
}
