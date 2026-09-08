"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveUnitPrice, type PriceableProduct } from "@/lib/catalog/pricing";
import { formatMoney } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/Button";

export function ProductDetailActions({ product }: { product: PriceableProduct }) {
  const [quantity, setQuantity] = useState(product.minOrderQuantity);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;
  const resolution = resolveUnitPrice(product, quantity);

  return (
    <div className="flex flex-col gap-3">
      {resolution.kind === "quote_required" ? (
        <div className="rounded-md border border-brand-primary/30 bg-brand-primary/5 p-3 text-sm">
          <p className="font-medium text-brand-primary-dark">Quantities of {product.bulkQuoteThreshold}+ need a custom quote.</p>
          <Link href={`/quote?productId=${product.id}&quantity=${quantity}`} className="mt-1 inline-block text-sm underline">
            Request a bulk quote for {quantity}
          </Link>
        </div>
      ) : (
        <p className="text-xl font-semibold">
          {formatMoney(resolution.unitPriceMinor)}
          {resolution.appliedTier && <span className="ml-2 text-sm font-normal text-brand-primary-dark">Bulk price applied</span>}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-stone-300">
          <button type="button" onClick={() => setQuantity((q) => Math.max(product.minOrderQuantity, q - 1))} className="px-3 py-1.5 text-lg leading-none" aria-label="Decrease quantity">
            −
          </button>
          <span className="min-w-8 text-center text-sm">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} className="px-3 py-1.5 text-lg leading-none" aria-label="Increase quantity">
            +
          </button>
        </div>
        <Button
          disabled={outOfStock || resolution.kind === "quote_required"}
          onClick={() => {
            addItem(product.id, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="flex-1"
        >
          {outOfStock ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}
        </Button>
      </div>

      {product.minOrderQuantity > 1 && <p className="text-xs text-stone-500">Minimum order: {product.minOrderQuantity}</p>}
      {!outOfStock && product.stock <= 10 && <p className="text-xs text-amber-600">Only {product.stock} left in stock.</p>}
    </div>
  );
}
