@AGENTS.md

# Ilorin Bulk Mart — project brief

A bulk foodstuff wholesale e-commerce platform for a Nigerian business (demo
name: **Ilorin Bulk Mart**, Ilorin, Kwara State) selling branded/packaged
food in bulk nationwide. Full spec: `docs/PRODUCT_BRIEF.md` (the original
master prompt this project is built from) — read it before making any
scope decision not already covered below.

Global working-mode rules for this whole workspace live one level up at
`../CLAUDE CODE DEVELOPMENT MODE.md` — professional/autonomous delivery,
not a tutorial; no TODO exercises; explain briefly before major phases,
then build. That file supersedes any "teaching mode" language in the
product brief.

## Phased scope

- **Phase 1 (current)** — polished demo/MVP: full customer flow (browse →
  bulk cart → checkout → payment → receipt → WhatsApp) and full admin
  dashboard (products, inventory + audit trail, orders, quotes, analytics,
  role-based staff). Do not build Phase 2/3 items now (see brief).
- **Phase 2** — real Paystack creds, real notifications, invoicing, more
  reporting.
- **Phase 3** — ERP-lite: procurement, suppliers, expenses, BI.

Architect Phase 1 so 2 and 3 don't require rebuilding — but don't build
their machinery early.

## Key architectural decisions already made

- **Stack**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4,
  Prisma + Postgres (Neon via Vercel Marketplace), Zustand (cart), Zod
  (validation), Auth.js v5 credentials + bcryptjs (admin auth), Recharts
  (admin analytics), lucide-react (icons). Hand-built Tailwind UI
  primitives instead of shadcn's CLI scaffold — most of what this
  dashboard needs (StockBadge, OrderStatusBadge, StatCard) is
  domain-specific anyway, so a small hand-built kit is less dependency
  surface for the same result.
- **Money**: integer kobo everywhere (`priceMinor`, `totalMinor`, ...),
  never floats. `formatMoney`/`toMinorUnits` in `src/lib/currency.ts`.
- **Business identity**: `src/lib/business.config.ts` — a plain TS object
  (name, tagline, contact, brand colors, delivery defaults), not env vars.
  Client-safe (no secrets), so it's importable from both server and client
  components. Real secrets (DB URL, Paystack secret key, auth secret) live
  in `src/lib/env.server.ts`, which validates `process.env` and must never
  be imported from a `"use client"` file — see the comment at its top for
  why (Next only inlines `NEXT_PUBLIC_*` into the client bundle).
- **Inventory rule (critical, from the brief)**: stock is decremented only
  when a payment is confirmed (`markPaymentSuccess` →
  `deductStockForOrder`), never at order creation. Every stock change
  writes an `InventoryMovement` row in the same transaction — that ledger
  is the audit trail, not a bolted-on log.
- **Order status**: one `OrderStatus` state machine on `Order`
  (PENDING_PAYMENT → PAID → PROCESSING → ... ). The admin UI's "Payment
  status" vs "Fulfillment status" (kept visually separate per the brief)
  are *derived* from this one field plus `Payment` records — see
  `src/lib/orders/status.ts` — rather than stored as two columns that
  could drift out of sync.
- **Payments**: `Payment` is a separate model from `Order` (one-to-many) —
  an order can have more than one attempt if an earlier one failed.
  Provider abstraction in `src/lib/payments/` (Paystack + a demo
  simulator used automatically when no real secret key is configured).
- **Bulk pricing**: `BulkPrice` tiers per product + an optional
  `bulkQuoteThreshold` (quantities at/above it route to a quote request
  instead of instant checkout). Resolution logic in
  `src/lib/catalog/pricing.ts`.
- **Delivery fee**: flat fee per Nigerian state (`DeliveryZone`), with a
  fallback default from `business.config.ts` for unlisted states. Single
  seam in `src/lib/delivery/index.ts` — later phases can make it
  weight/quantity-dependent without touching call sites.
- **Roles**: `AdminRole` enum (OWNER/ADMIN/WAREHOUSE_STAFF), not a
  Role/Permission table — 3 known roles; a new one later is one enum
  value + one entry in the permissions map, not a migration.

## Environment quirk (read before debugging "the DB is unreachable")

This sandbox's outbound network to Neon (and to fonts.googleapis.com) has
been unreliable — connections that work fine from Vercel's build/runtime
network sometimes hang or P1001 from here. If a DB command hangs or fails
here but the deployed app is fine, it's very likely this, not a real
config problem. Workaround used to get the initial schema onto Postgres
without a local direct connection: generate migration SQL with
`prisma migrate diff --from-empty --to-schema-datamodel ... --script`
(no DB connection needed) and either apply it by hand or let
`prisma migrate deploy` run as part of the Vercel build (`package.json`
`build` script). A one-off secret-gated `/api/admin/seed` route exists for
the same reason — seeding ran on Vercel's network, not locally.

## Where things stand / what's next

Phase 1 is functionally complete and passes `tsc --noEmit` + `next build`
+ `eslint` clean:

- **Storefront**: home, shop (category/search filters), product detail
  (bulk pricing table, quote-required state), cart, checkout
  (pickup/delivery, live delivery-fee preview, Paystack/demo payment),
  order confirmation (WhatsApp continuation), bulk quote request +
  confirmation.
- **Admin**: Auth.js credentials login, middleware-protected `/admin/**`,
  role-gated dashboard (revenue/order/inventory stats, trend chart, best
  sellers, sales by category), product CRUD, inventory (adjust stock +
  movement history), orders (status updates, payment/fulfillment views
  kept visually separate), quotes (status + admin notes), staff (Owner-
  only CRUD).

Demo admin logins (seeded — see `src/lib/seed/runSeed.ts`, rotate before
any real launch): `owner@ilorinbulkmart.demo` / `Owner123!`,
`admin@ilorinbulkmart.demo` / `Admin123!`,
`warehouse@ilorinbulkmart.demo` / `Warehouse123!`.

Not yet done: the DB was reset (see "Environment quirk" above — old and
new schemas collided) and needs `prisma migrate deploy` + the seed route
run again post-reset; Docker (brief explicitly wants this taught as a
distinct later step, not bundled in); a real Paystack account (currently
demo-mode payments only, by design); real business contact details in
`business.config.ts` (currently placeholders).
