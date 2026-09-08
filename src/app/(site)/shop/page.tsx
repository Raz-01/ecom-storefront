import Link from "next/link";
import { getActiveCategories, getActiveProducts, type ProductSort } from "@/lib/catalog/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CategoryIllustration } from "@/components/site/icons/CategoryIllustration";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A–Z" },
];

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const categorySlug = typeof sp.category === "string" ? sp.category : undefined;
  const search = typeof sp.q === "string" ? sp.q : undefined;
  const sort = (typeof sp.sort === "string" ? sp.sort : "newest") as ProductSort;

  const [categories, products] = await Promise.all([getActiveCategories(), getActiveProducts({ categorySlug, search, sort })]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Shop the catalogue</h1>
        <p className="text-sm text-stone-600">Bulk quantities, wholesale prices — bags, sacks, cartons and kegs.</p>
      </div>

      <form className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-surface p-4 shadow-sm sm:flex-row sm:items-center" action="/shop">
        {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
        <Input type="search" name="q" defaultValue={search} placeholder="Search products, brands, categories…" className="sm:max-w-sm" />
        <Select name="sort" defaultValue={sort} className="sm:w-56">
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
            !categorySlug ? "bg-brand-primary text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              categorySlug === category.slug ? "bg-brand-primary text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <CategoryIllustration categorySlug={category.slug} className="h-4 w-4" />
            {category.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <p className="text-sm font-medium text-stone-700">No products found.</p>
          <p className="text-sm text-stone-500">Try another search or browse our categories.</p>
        </div>
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
