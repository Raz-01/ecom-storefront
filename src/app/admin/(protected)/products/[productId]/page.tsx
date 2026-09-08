import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { formatMoney } from "@/lib/currency";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[productId]">) {
  await requirePermission("products:manage");
  const { productId } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, include: { bulkPrices: { orderBy: { minQuantity: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{product.name}</h1>
        <div className="text-right text-sm">
          <p className="text-stone-500">
            Current stock: <span className="font-medium text-stone-900">{product.stock}</span>
          </p>
          <Link href={`/admin/inventory/${product.id}`} className="text-xs text-brand-primary-dark underline">
            Adjust stock in Inventory
          </Link>
        </div>
      </div>
      {product.previousPriceMinor && <p className="text-xs text-stone-500">Previous price: {formatMoney(product.previousPriceMinor)}</p>}

      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          brand: product.brand ?? "",
          categoryId: product.categoryId,
          packageType: product.packageType,
          packageSize: product.packageSize,
          priceMajor: product.priceMinor / 100,
          lowStockThreshold: product.lowStockThreshold,
          minOrderQuantity: product.minOrderQuantity,
          bulkQuoteThreshold: product.bulkQuoteThreshold ?? "",
          imageUrl: product.imageUrl ?? "",
          isFeatured: product.isFeatured,
          bulkPrices: product.bulkPrices.map((t) => ({ minQuantity: t.minQuantity, priceMajor: t.pricePerUnitMinor / 100 })),
        }}
      />
    </div>
  );
}
