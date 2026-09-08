import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog/queries";
import { businessConfig } from "@/lib/business.config";
import { ProductCard } from "@/components/site/ProductCard";
import { buttonClasses } from "@/components/ui/Button";

const TRUST_POINTS = [
  { title: "Sourced direct from manufacturers", body: "No middlemen markup — branded, packaged foodstuff at genuine wholesale prices." },
  { title: "Nationwide delivery", body: "From our Ilorin warehouse to every state in Nigeria, or collect in person." },
  { title: "Built for bulk buyers", body: "Individuals, retailers, restaurants, supermarkets and distributors all order here." },
];

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getActiveCategories(),
    getActiveProducts({ featuredOnly: true }),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-stone-200 bg-gradient-to-b from-brand-primary/5 to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-primary-dark">
            {businessConfig.location.city}, {businessConfig.location.state}
          </p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">{businessConfig.tagline}</h1>
          <p className="max-w-xl text-stone-600">{businessConfig.description}</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className={buttonClasses("primary", "lg")}>
              Shop the catalogue
            </Link>
            <Link href="/quote" className={buttonClasses("outline", "lg")}>
              Request a bulk quote
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="rounded-lg border border-stone-200 p-4 text-center text-sm font-medium hover:border-brand-primary hover:text-brand-primary-dark"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured products</h2>
            <Link href="/shop" className="text-sm font-medium text-brand-primary-dark underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {TRUST_POINTS.map((point) => (
            <div key={point.title}>
              <h3 className="mb-1 text-sm font-semibold">{point.title}</h3>
              <p className="text-sm text-stone-600">{point.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
