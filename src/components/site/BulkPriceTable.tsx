import { formatMoney } from "@/lib/currency";

type Tier = { minQuantity: number; pricePerUnitMinor: number };

/** Renders the "1–9 units ₦X each, 10–49 ₦Y each, 50+ Request quote" table the project brief describes for products with bulk-price tiers. */
export function BulkPriceTable({ basePriceMinor, tiers, bulkQuoteThreshold }: { basePriceMinor: number; tiers: Tier[]; bulkQuoteThreshold: number | null }) {
  if (tiers.length === 0 && !bulkQuoteThreshold) return null;

  const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  const rows: { range: string; price: string }[] = [];

  let previousMin = 1;
  for (const tier of sorted) {
    if (previousMin < tier.minQuantity) {
      rows.push({ range: `${previousMin}–${tier.minQuantity - 1}`, price: `${formatMoney(basePriceMinor)} each` });
    }
    previousMin = tier.minQuantity;
  }

  const lastTier = sorted[sorted.length - 1];
  const lastRangeEnd = bulkQuoteThreshold ? bulkQuoteThreshold - 1 : null;

  if (lastTier) {
    rows.push({
      range: lastRangeEnd ? `${lastTier.minQuantity}–${lastRangeEnd}` : `${lastTier.minQuantity}+`,
      price: `${formatMoney(lastTier.pricePerUnitMinor)} each`,
    });
  } else if (sorted.length === 0 && lastRangeEnd) {
    rows.push({ range: `1–${lastRangeEnd}`, price: `${formatMoney(basePriceMinor)} each` });
  }

  if (bulkQuoteThreshold) {
    rows.push({ range: `${bulkQuoteThreshold}+`, price: "Request bulk quote" });
  }

  return (
    <div className="rounded-md border border-stone-200">
      <p className="border-b border-stone-200 px-3 py-2 text-xs font-medium uppercase tracking-wide text-stone-500">Bulk pricing</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.range} className="border-b border-stone-100 last:border-0">
              <td className="px-3 py-2 text-stone-600">{row.range} units</td>
              <td className="px-3 py-2 text-right font-medium">{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
