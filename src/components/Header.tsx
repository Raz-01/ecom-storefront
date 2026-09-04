import Link from "next/link";
import { publicConfig } from "@/lib/publicConfig";
import { CartBadge } from "@/components/CartBadge";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {publicConfig.business.name}
        </Link>
        <CartBadge />
      </div>
    </header>
  );
}
