"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export function ProductDetailActions({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = stock <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-lg leading-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="px-3 py-1.5 text-lg leading-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem(productId, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="flex-1 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
        >
          {outOfStock ? "Out of stock" : added ? "Added to cart ✓" : "Add to cart"}
        </button>
      </div>
      {!outOfStock && stock <= 5 && <p className="text-xs text-amber-600 dark:text-amber-400">Only {stock} left in stock.</p>}
    </div>
  );
}
