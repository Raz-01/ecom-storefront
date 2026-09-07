import Link from "next/link";
import { businessConfig } from "@/lib/business.config";

/**
 * Public storefront header. Deliberately minimal for now — the cart badge,
 * search bar and category nav land with the shop pages in the next pass;
 * this just needs to render the real business identity everywhere.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand-primary-dark dark:text-brand-primary">
          {businessConfig.name}
        </Link>
        <a
          href={`https://wa.me/${businessConfig.contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark"
        >
          Chat on WhatsApp
        </a>
      </div>
    </header>
  );
}
