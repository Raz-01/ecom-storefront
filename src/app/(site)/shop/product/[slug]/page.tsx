import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveProductBySlug } from "@/lib/catalog/queries";
import { businessConfig } from "@/lib/business.config";
import { StockBadge } from "@/components/domain/StockBadge";
import { ProductDetailActions } from "@/components/site/ProductDetailActions";
import { BulkPriceTable } from "@/components/site/BulkPriceTable";
import { buttonClasses } from "@/components/ui/Button";
import { CategoryIllustration } from "@/components/site/icons/CategoryIllustration";

export default async function ProductPage({ params }: PageProps<"/shop/product/[slug]">) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row">
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-surface-brand-tint shadow-sm md:w-1/2">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-12">
            <CategoryIllustration categorySlug={product.category.slug} className="h-full w-full" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {product.category.name}
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-sm text-stone-500">{product.packageSize}</p>
        </div>

        <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />

        <ProductDetailActions
          product={{
            id: product.id,
            name: product.name,
            priceMinor: product.priceMinor,
            stock: product.stock,
            isActive: product.isActive,
            minOrderQuantity: product.minOrderQuantity,
            bulkQuoteThreshold: product.bulkQuoteThreshold,
            bulkPrices: product.bulkPrices,
          }}
        />

        <BulkPriceTable basePriceMinor={product.priceMinor} tiers={product.bulkPrices} bulkQuoteThreshold={product.bulkQuoteThreshold} />

        <p className="text-sm leading-relaxed text-stone-600">{product.description}</p>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200 bg-surface-muted p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Delivery</p>
            <p className="text-stone-600">Nationwide, from our {businessConfig.location.city} warehouse. Fee shown at checkout.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Pickup</p>
            <p className="text-stone-600">Collect free from {businessConfig.location.address}.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row">
          <Link href={`/quote?productId=${product.id}`} className={buttonClasses("outline", "md")}>
            Request a bulk quote
          </Link>
          <a
            href={`https://wa.me/${businessConfig.contact.whatsapp}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${product.packageSize}).`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("whatsapp", "md")}
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
