import { businessConfig } from "@/lib/business.config";

/** Format an integer minor-unit amount (kobo) as a display string, e.g. "₦12,500.00". */
export function formatMoney(amountMinor: number, currency: string = businessConfig.currency): string {
  return new Intl.NumberFormat(businessConfig.locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amountMinor / 100);
}

/** Convert a major-unit amount (naira) to integer minor units (kobo), guarding against float drift. */
export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}
