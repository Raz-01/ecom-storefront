import Link from "next/link";
import { businessConfig } from "@/lib/business.config";
import { buttonClasses } from "@/components/ui/Button";
import { CartBadge } from "@/components/site/CartBadge";
import { Logo } from "@/components/site/Logo";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-stone-200 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          <Link href="/shop" className="hover:text-brand-primary-dark">
            Shop
          </Link>
          <Link href="/quote" className="hover:text-brand-primary-dark">
            Request Bulk Quote
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <CartBadge />
          <a
            href={`https://wa.me/${businessConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("whatsapp", "md", "hidden sm:inline-flex")}
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <nav className="flex items-center gap-5 border-t border-stone-100 px-4 py-2 text-sm font-medium text-stone-700 md:hidden">
        <Link href="/shop">Shop</Link>
        <Link href="/quote">Request Bulk Quote</Link>
      </nav>
    </header>
  );
}
