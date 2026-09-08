"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";
import { StockBadge } from "@/components/domain/StockBadge";
import { Button } from "@/components/ui/Button";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  imageUrl: string | null;
  packageSize: string;
  priceMinor: number;
  stock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  bulkPrices: { minQuantity: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;
  const hasBulkPricing = product.bulkPrices.length > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white">
      <Link href={`/shop/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-stone-100">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">No image</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.brand && <span className="text-xs text-stone-500">{product.brand}</span>}
        <Link href={`/shop/product/${product.slug}`} className="text-sm font-medium hover:underline">
          {product.name}
        </Link>
        <span className="text-xs text-stone-500">{product.packageSize}</span>
        <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col">
            <span className="font-semibold">{formatMoney(product.priceMinor)}</span>
            {hasBulkPricing && <span className="text-xs text-brand-primary-dark">Bulk pricing available</span>}
          </div>
          <Button size="sm" disabled={outOfStock} onClick={() => addItem(product.id, product.minOrderQuantity)}>
            {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
