# Ilorin Bulk Mart

A bulk-foodstuff wholesale e-commerce platform for a Nigerian business based
in Ilorin, Kwara State — branded/packaged food (rice, beans, garri, flour,
oil, noodles, spices) sold in bulk to individuals, retailers, restaurants
and distributors, delivered nationwide.

This is the **Phase 1 demo/MVP** of a three-phase plan (see
[`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) for the full spec, and
`CLAUDE.md` for the working architectural notes). "Ilorin Bulk Mart" is a
placeholder business identity — see [Configuration](#configuration) for
where to put the real one.

## Features

**Storefront**
- Home, shop (category filters, search), product detail pages
- Bulk quantity pricing (tiered per-unit pricing above a threshold; a
  "request a quote" path above that)
- Cart (persisted client-side), guest checkout — no customer accounts
- Pickup or nationwide delivery, with a live delivery-fee preview by state
- Paystack payment (falls back to an in-app demo payment simulator when no
  real Paystack key is configured)
- Order confirmation with a WhatsApp continuation link
- Bulk quote request flow, with its own WhatsApp handoff

**Admin dashboard** (`/admin`, staff-only)
- Auth.js credentials login, server-side route protection
- Role-based access: **Owner** (everything), **Admin**/sales staff (orders +
  quotes), **Warehouse Staff** (inventory + fulfillment)
- Overview analytics: revenue, order counts, inventory health, a
  revenue/orders trend chart, best sellers, sales by category
- Product management (create/edit/deactivate, bulk price tiers)
- Inventory management with a full movement ledger (stock received, sold,
  cancelled, manually adjusted) — an audit trail, not just a stock number
- Order management: status updates, with **payment status** and
  **fulfillment status** always shown as two distinct things
- Quote management (status, admin notes)
- Staff management (Owner-only)

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, hand-built UI primitives (`src/components/ui`) |
| Database | PostgreSQL (Neon), via Prisma ORM |
| Auth | Auth.js v5 (Credentials provider), bcryptjs, JWT sessions |
| Validation | Zod |
| Cart state | Zustand (persisted to `localStorage`) |
| Charts | Recharts |
| Icons | lucide-react |
| Hosting | Vercel |

### Why these choices

- **Integer minor units for money** (`priceMinor`, `totalMinor`, kobo — see
  `src/lib/currency.ts`), never floats — eliminates an entire class of
  rounding bugs in financial math.
- **A single `OrderStatus` state machine**, not separate payment/fulfillment
  columns — the admin UI's two-axis "Payment status" / "Fulfillment status"
  view (`src/lib/orders/status.ts`) is *derived* from this one field plus
  `Payment` records, so the two views can never drift out of sync with each
  other or with reality.
- **Stock is decremented only on confirmed payment**, never at order
  creation (`src/lib/inventory/movements.ts` `deductStockForOrder`, called
  from `markPaymentSuccess`) — an abandoned checkout can never hold
  inventory hostage.
- **`InventoryMovement` is an append-only ledger**, not a bolted-on log —
  every stock change (received, sold, cancelled, manually adjusted) writes
  one row in the same transaction as the stock update, so total stock is
  always reconstructable and explainable from history.
- **`AdminRole` is a plain enum**, not a Role/Permission database table —
  three known roles; a fourth later is one enum value plus one entry in
  `src/lib/auth/permissions.ts`, not a migration.
- **Auth config is split** into `src/auth.config.ts` (edge-safe: no
  providers) and `src/auth.ts` (full config: Credentials + bcrypt + Prisma).
  The Credentials provider's dependencies are too heavy for an Edge
  Middleware bundle (Vercel's 1MB limit) — `middleware.ts` only needs to
  read an existing JWT, not authenticate one, so it uses the light config.

## Architecture

```
src/
  app/
    (site)/          storefront route group — home, shop, product, cart,
                      checkout, order confirmation, quote request
    admin/
      login/          admin sign-in (public)
      (protected)/     everything else under /admin — guarded by middleware.ts
    api/
      auth/[...nextauth]/   Auth.js handler
      payments/webhook/      Paystack webhook (server-to-server payment confirmation)
      admin/                 one-off ops routes (seed, migration repair) — see below
  components/
    site/     customer-facing components
    admin/    dashboard components
    domain/   shared badges (order status, stock level) used in both
    ui/       hand-built primitives (Button, Card, Table, Field, Badge, StatCard)
  lib/
    business.config.ts   client-safe business identity (name, contact, brand, currency)
    env.server.ts        server-only secrets validation (never import from "use client")
    catalog/              product/category queries, bulk-price resolution
    orders/                order creation, payment confirmation, cancellation, status derivation
    inventory/             stock adjustment + the movement ledger
    payments/              provider abstraction (Paystack + demo simulator)
    delivery/              delivery-fee calculation by state
    quotes/                quote request creation
    auth/                  session helpers + role permissions
    analytics/             dashboard aggregate queries
    validation/            Zod schemas
  store/cartStore.ts      Zustand cart, persisted to localStorage
  auth.config.ts / auth.ts   see "Why these choices" above
  middleware.ts            protects /admin/*
prisma/
  schema.prisma
  seed.ts / src/lib/seed/runSeed.ts   demo data (idempotent — safe to re-run)
```

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum — see below
npm run db:migrate      # applies prisma/migrations to your database
npm run db:seed         # demo catalog, delivery zones, admin users, order/quote history
npm run dev
```

Open http://localhost:3000 for the storefront, http://localhost:3000/admin
for the dashboard.

### Demo admin logins

Seeded by `npm run db:seed` (see `src/lib/seed/runSeed.ts`) — rotate or
remove before any real launch:

| Role | Email | Password |
|---|---|---|
| Owner | `owner@ilorinbulkmart.demo` | `Owner123!` |
| Admin | `admin@ilorinbulkmart.demo` | `Admin123!` |
| Warehouse Staff | `warehouse@ilorinbulkmart.demo` | `Warehouse123!` |

## Configuration

- **Business identity** (name, tagline, phone, WhatsApp number, address,
  brand colors, currency) — `src/lib/business.config.ts`. A plain
  TypeScript object, not env vars, so it's type-checked and easy to review
  in one place. Every `PLACEHOLDER`-commented value should be replaced
  with the real business's details before going live.
- **Secrets** (`DATABASE_URL`, Paystack keys, `AUTH_SECRET`) —
  environment variables, validated at startup by `src/lib/env.server.ts`.
  See `.env.example` for the full list with explanations. This module must
  never be imported from a `"use client"` file (Next only inlines
  `NEXT_PUBLIC_*` vars into the browser bundle — everything else would
  evaluate to `undefined` there and fail validation).

## Database

PostgreSQL via Prisma. `DATABASE_URL` should be the pooled connection
string (used at runtime); `DATABASE_URL_UNPOOLED` is the direct connection,
used only for running migrations (see `prisma/schema.prisma`'s `directUrl`
and the Neon connection-pooling docs — migrations over a pooled/pgbouncer
connection are unreliable).

```bash
npm run db:migrate   # prisma migrate dev — creates + applies a migration from schema changes
npm run db:deploy    # prisma migrate deploy — applies existing migrations, no schema diffing (used in production)
npm run db:seed      # prisma db seed — idempotent demo data
npm run db:studio    # prisma studio — browse the database visually
```

## Payments

Payments go through a provider abstraction (`src/lib/payments/`) so
checkout code never talks to Paystack directly:

- **No real `PAYSTACK_SECRET_KEY` configured** (the default): an in-app
  demo payment page simulates a successful or failed charge, so the full
  checkout → payment → confirmation flow can be built, demoed and tested
  without real credentials.
- **Real Paystack key configured**: checkout redirects to Paystack's
  hosted page. Payment is confirmed two ways, both idempotent (whichever
  fires first wins, the other is a no-op) — the customer's browser
  returning to `/checkout/callback`, and Paystack's webhook
  (`/api/payments/webhook`, HMAC-signature verified) which is the
  authoritative path independent of whether the browser ever comes back.

Get real keys from the [Paystack dashboard](https://dashboard.paystack.com/#/settings/developers)
and set them via your hosting provider's environment variables (never
commit them). Point Paystack's webhook URL at
`https://<your-domain>/api/payments/webhook`.

## Deployment

Deployed on Vercel, with Postgres via Neon (provisioned through the Vercel
Marketplace integration). `npm run build` runs `prisma migrate deploy`
before `next build`, so pushing a migration alongside code applies it
automatically on deploy.

Two one-off, secret-gated routes exist under `/api/admin/` for operational
tasks that need to run against the production database from outside a
local shell (`x-seed-secret` header, gated by the `SEED_SECRET` env var —
unset it to disable both entirely once no longer needed):

- `/api/admin/seed` — runs the same idempotent seed as `npm run db:seed`.
- `/api/admin/fix-migration` — diagnoses (`GET`) or, with `?reset=true`
  (`POST`), drops and recreates the public schema. **Destructive** — only
  ever appropriate against pre-launch/demo data, never a live database with
  real orders.

## Testing

No automated test suite yet. The business-critical logic this project
brief calls out for testing (inventory only decreases on confirmed
payment, stock never goes negative, order totals are always recalculated
server-side and never trusted from the client, order items snapshot their
price, warehouse staff can't reach financial analytics) has been verified
manually end-to-end against the deployed environment, but doesn't yet have
regression coverage. Adding a Vitest suite for `src/lib/orders`,
`src/lib/inventory`, and `src/lib/catalog/pricing` is the natural next step
before this goes further than a demo.

## Roadmap

- **Phase 2**: production Paystack, real email/WhatsApp notifications,
  invoice/receipt generation, delivery fee management, staff management
  improvements, audit logs, better reporting.
- **Phase 3**: ERP-lite — procurement, supplier management, purchase
  orders, expenses, profit tracking, advanced inventory valuation,
  financial reporting, business intelligence.

Docker isn't part of Phase 1 by design (see `docs/PRODUCT_BRIEF.md`) — it's
introduced as a deliberate, explained step once the application itself is
stable, not bundled in during initial development.
