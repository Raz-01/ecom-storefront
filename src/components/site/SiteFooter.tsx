import Link from "next/link";
import { businessConfig } from "@/lib/business.config";
import { Logo } from "@/components/site/Logo";
import { currentYear } from "@/lib/utils/currentYear";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-stone-200 bg-surface-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo />
          <p className="text-sm text-stone-600">{businessConfig.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-foreground">Shop</span>
            <Link href="/shop" className="text-stone-600 hover:text-brand-primary-dark">
              Browse products
            </Link>
            <Link href="/quote" className="text-stone-600 hover:text-brand-primary-dark">
              Request a quote
            </Link>
            <Link href="/cart" className="text-stone-600 hover:text-brand-primary-dark">
              View cart
            </Link>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-foreground">Contact</span>
            <a href={`tel:${businessConfig.contact.phone}`} className="text-stone-600 hover:text-brand-primary-dark">
              {businessConfig.contact.phone}
            </a>
            <a href={`mailto:${businessConfig.contact.email}`} className="text-stone-600 hover:text-brand-primary-dark">
              {businessConfig.contact.email}
            </a>
            <a
              href={`https://wa.me/${businessConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-600 hover:text-brand-primary-dark"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-foreground">Location</span>
            <span className="text-stone-600">{businessConfig.location.address}</span>
            <span className="text-stone-600">Nationwide delivery</span>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-500 sm:px-6">
        © {currentYear()} {businessConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
