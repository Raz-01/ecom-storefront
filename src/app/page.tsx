import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { category: categorySlug } = await searchParams;
  const activeCategorySlug = typeof categorySlug === "string" ? categorySlug : undefined;

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getActiveProducts(activeCategorySlug),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !activeCategorySlug
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/?category=${category.slug}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeCategorySlug === category.slug
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-zinc-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
