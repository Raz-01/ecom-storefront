import { publicConfig } from "@/lib/publicConfig";

/** Format an integer minor-unit amount (e.g. kobo) as a display string, e.g. "₦12,500.00". */
export function formatMoney(amountMinor: number, currency: string = publicConfig.currency): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amountMinor / 100);
}

/** Convert a major-unit amount (e.g. naira) to integer minor units (kobo), guarding against float drift. */
export function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}
