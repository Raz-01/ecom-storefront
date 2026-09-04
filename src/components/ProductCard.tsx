"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  priceMinor: number;
  stock: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-900">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">No image</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.slug}`} className="text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-semibold">{formatMoney(product.priceMinor)}</span>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addItem(product.id)}
            className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
