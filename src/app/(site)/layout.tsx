import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";

/** Wraps every customer-facing page with the storefront header. `/admin/*` is a sibling outside this route group and gets its own layout — the brief is explicit that the admin dashboard must not look like the customer site. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
