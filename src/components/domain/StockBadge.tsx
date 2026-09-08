import { Badge } from "@/components/ui/Badge";

/** The three-state stock indicator used throughout the storefront and admin inventory screens — one place decides the healthy/low/out thresholds and labels. */
export function StockBadge({ stock, lowStockThreshold }: { stock: number; lowStockThreshold: number }) {
  if (stock <= 0) return <Badge tone="danger">Out of stock</Badge>;
  if (stock <= lowStockThreshold) return <Badge tone="warning">Low stock — {stock} left</Badge>;
  return <Badge tone="success">In stock</Badge>;
}
