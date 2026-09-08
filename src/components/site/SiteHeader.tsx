import Link from "next/link";
import { businessConfig } from "@/lib/business.config";
import { buttonClasses } from "@/components/ui/Button";
import { CartBadge } from "@/components/site/CartBadge";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand-primary-dark">
          {businessConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/shop">Shop</Link>
          <Link href="/quote">Request Bulk Quote</Link>
        </nav>
        <div className="flex items-center gap-4">
          <CartBadge />
          <a href={`https://wa.me/${businessConfig.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className={buttonClasses("whatsapp", "md")}>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
