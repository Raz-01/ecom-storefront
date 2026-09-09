import { getActiveProducts } from "@/lib/catalog/queries";
import { QuoteRequestForm } from "@/components/site/QuoteRequestForm";

export default async function QuotePage({ searchParams }: PageProps<"/quote">) {
  const sp = await searchParams;
  const products = await getActiveProducts();

  const productId = typeof sp.productId === "string" ? sp.productId : undefined;
  const quantity = typeof sp.quantity === "string" ? Number(sp.quantity) : undefined;
  const initialLine = productId && products.some((p) => p.id === productId) ? { productId, quantity: quantity && quantity > 0 ? quantity : 10 } : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-2 px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold">Request a bulk quote</h1>
      <p className="mb-4 text-sm text-stone-600">
        Tell us what you need and how much, and we&apos;ll get back to you with pricing, usually over WhatsApp.
      </p>
      <QuoteRequestForm products={products.map((p) => ({ id: p.id, name: p.name, packageSize: p.packageSize }))} initialLine={initialLine} />
    </main>
  );
}
