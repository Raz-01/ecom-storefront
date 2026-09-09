"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { businessConfig } from "@/lib/business.config";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import type { AdminRole } from "@prisma/client";

/**
 * Hamburger + slide-over drawer for admin navigation below the `md`
 * breakpoint, where `AdminSidebar` is hidden entirely. Without this,
 * there is no way to move between admin sections on a phone at all.
 */
export function MobileAdminNav({ role }: { role: AdminRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation, so tapping a link doesn't leave the drawer open
  // behind the new page. Adjusting state during render (React's documented
  // pattern for "reset state when a prop changes") rather than in an
  // effect — an effect here would set state that was already false on
  // every render where pathname happens to be re-passed unchanged,
  // triggering an extra, avoidable render.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 max-w-[80vw] flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-4">
              <div className="flex items-center gap-2">
                <LogoMark className="h-7 w-7" />
                <div>
                  <p className="text-sm font-semibold leading-tight text-foreground">{businessConfig.name}</p>
                  <p className="text-xs text-stone-500">Admin</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close menu" className="flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                <X size={18} />
              </button>
            </div>
            <AdminNavLinks role={role} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
