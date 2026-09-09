import Link from "next/link";
import { getActiveCategories, getActiveProducts } from "@/lib/catalog/queries";
import { businessConfig } from "@/lib/business.config";
import { ProductCard } from "@/components/site/ProductCard";
import { buttonClasses } from "@/components/ui/Button";
import { CategoryIllustration } from "@/components/site/icons/CategoryIllustration";

// Live stock/featured-product state, not a snapshot frozen at build/deploy
// time — an admin toggling a product's stock or "featured" flag should
// show up immediately, not wait for the next deploy. Also sidesteps
// needing DB access during `next build` itself, which shouldn't depend on
// the database being reachable.
export const dynamic = "force-dynamic";

const TRUST_POINTS = [
  { title: "Sourced direct from manufacturers", body: "No middlemen markup, just branded, packaged foodstuff at genuine wholesale prices." },
  { title: "Nationwide delivery", body: "From our Ilorin warehouse to every state in Nigeria, or collect in person." },
  { title: "Built for bulk buyers", body: "Individuals, retailers, restaurants, supermarkets and distributors all order here." },
  { title: "Secure payments", body: "Checkout with Paystack. Your payment is verified before your order is confirmed." },
];

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getActiveCategories(),
    getActiveProducts({ featuredOnly: true }),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-stone-200 bg-surface-brand-tint">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-20">
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-primary-dark">
              {businessConfig.location.city}, {businessConfig.location.state} · Nationwide delivery
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{businessConfig.tagline}</h1>
            <p className="max-w-lg text-stone-600">{businessConfig.description}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className={buttonClasses("primary", "lg")}>
                Shop in bulk
              </Link>
              <Link href="/quote" className={buttonClasses("outline", "lg")}>
                Request a bulk quote
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {categories.slice(0, 8).map((category, i) => (
              <div
                key={category.id}
                className={`flex aspect-square items-center justify-center rounded-2xl border border-stone-200 bg-surface p-3 shadow-sm ${
                  i % 5 === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <CategoryIllustration categorySlug={category.slug} className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-surface p-4 text-center shadow-sm transition-colors hover:border-brand-primary"
            >
              <CategoryIllustration categorySlug={category.slug} className="h-12 w-12" />
              <span className="text-sm font-medium text-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Featured products</h2>
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

      <section className="border-t border-stone-200 bg-surface-muted">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex flex-col gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary-dark">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
              <p className="text-sm text-stone-600">{point.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
