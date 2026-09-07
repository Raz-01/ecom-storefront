import { businessConfig } from "@/lib/business.config";

/**
 * Placeholder home page — the real catalog-driven homepage (hero, featured
 * products, categories, trust indicators) lands with the shop pages. This
 * exists so the app has a working root route while that's being built.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-primary">
        {businessConfig.location.city}, {businessConfig.location.state}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{businessConfig.tagline}</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">{businessConfig.description}</p>
    </main>
  );
}
