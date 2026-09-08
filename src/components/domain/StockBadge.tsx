import { Badge } from "@/components/ui/Badge";

const DOT_CLASSES = {
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-600",
} as const;

function Dot({ tone }: { tone: keyof typeof DOT_CLASSES }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]}`} aria-hidden="true" />;
}

/**
 * The three-state stock indicator used throughout the storefront and admin
 * inventory screens — one place decides the healthy/low/out thresholds and
 * labels. A colored dot backs up the badge tone for a quick scan, but the
 * text label is what actually carries the meaning (never color alone).
 */
export function StockBadge({ stock, lowStockThreshold }: { stock: number; lowStockThreshold: number }) {
  if (stock <= 0)
    return (
      <Badge tone="danger">
        <Dot tone="danger" /> Out of stock
      </Badge>
    );
  if (stock <= lowStockThreshold)
    return (
      <Badge tone="warning">
        <Dot tone="warning" /> Low stock — {stock} left
      </Badge>
    );
  return (
    <Badge tone="success">
      <Dot tone="success" /> In stock
    </Badge>
  );
}
