import Image from "next/image";
import { notFound } from "next/navigation";
import { getActiveProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/currency";
import { ProductDetailActions } from "@/components/ProductDetailActions";

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row">
      <div className="relative aspect-square w-full flex-shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-900 md:w-1/2">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="rounded-lg object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{product.category.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        </div>
        <p className="text-xl font-semibold">{formatMoney(product.priceMinor)}</p>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{product.description}</p>
        <ProductDetailActions productId={product.id} stock={product.stock} />
      </div>
    </main>
  );
}
