"use client";

import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/currency";
import { useCartStore } from "@/store/cartStore";
import { StockBadge } from "@/components/domain/StockBadge";
import { Button } from "@/components/ui/Button";
import { CategoryIllustration } from "@/components/site/icons/CategoryIllustration";

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
  category: { slug: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;
  const hasBulkPricing = product.bulkPrices.length > 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/shop/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full bg-surface-brand-tint">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-6 transition-transform group-hover:scale-105">
              <CategoryIllustration categorySlug={product.category.slug} className="h-full w-full max-w-32" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.brand && <span className="text-xs font-medium uppercase tracking-wide text-stone-500">{product.brand}</span>}
        <Link href={`/shop/product/${product.slug}`} className="text-sm font-medium leading-snug text-foreground hover:text-brand-primary-dark">
          {product.name}
        </Link>
        <span className="text-xs text-stone-500">
          {product.packageSize}
          {product.minOrderQuantity > 1 && ` · Min. order ${product.minOrderQuantity}`}
        </span>
        <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{formatMoney(product.priceMinor)}</span>
            {hasBulkPricing && <span className="text-xs font-medium text-brand-primary-dark">Bulk pricing available</span>}
          </div>
          <Button size="sm" disabled={outOfStock} onClick={() => addItem(product.id, product.minOrderQuantity)}>
            {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
