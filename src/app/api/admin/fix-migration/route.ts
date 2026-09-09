import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";

/**
 * One-off repair endpoint. This database previously held an entirely
 * different (now-deleted) schema from an earlier iteration of this
 * project. When the new schema's migration was applied by hand (see
 * CLAUDE.md "Environment quirk"), `CREATE TABLE` statements for tables
 * that happened to share a name with the old schema (`Product`,
 * `Category`, `Order`, `OrderItem`) silently no-opped as "already
 * exists" — leaving those tables with the *old* schema's columns instead
 * of the new one's.
 *
 * `reset=true` drops the entire public schema and recreates it empty —
 * safe because this is pre-launch demo data, zero real customers. After
 * that, the next deploy's `prisma migrate deploy` (see package.json
 * `build`) applies the current migration cleanly and correctly through
 * Prisma's own tracked process, rather than this route trying to hand-
 * replay SQL. `GET` (no `reset`) only diagnoses; nothing is changed.
 *
 * Same secret-gating as `/api/admin/seed`; safe to remove once no longer
 * needed.
 */
function checkSecret(request: NextRequest): boolean {
  return !!serverEnv.seedSecret && request.headers.get("x-seed-secret") === serverEnv.seedSecret;
}

async function diagnose() {
  const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );
  const types = await prisma.$queryRawUnsafe<{ typname: string }[]>(
    `SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname`,
  );
  let migrations: unknown[] = [];
  try {
    migrations = await prisma.$queryRawUnsafe(`SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at`);
  } catch {
    // table doesn't exist (e.g. right after a reset) — that's fine, just report empty.
  }
  let products: unknown[] = [];
  try {
    products = await prisma.$queryRawUnsafe(`SELECT sku, slug, name, "isActive" FROM "Product" ORDER BY sku`);
  } catch {
    // table doesn't exist yet — fine, report empty.
  }
  return { tables: tables.map((t) => t.tablename), types: types.map((t) => t.typname), migrations, products };
}

export async function GET(request: NextRequest) {
  if (!checkSecret(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    return NextResponse.json({ ok: true, ...(await diagnose()) });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkSecret(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reset = request.nextUrl.searchParams.get("reset") === "true";
  if (!reset) {
    return NextResponse.json({ error: "Pass ?reset=true to confirm dropping and recreating the public schema" }, { status: 400 });
  }

  try {
    await prisma.$executeRawUnsafe(`DROP SCHEMA public CASCADE`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public`);
    const diagnosis = await diagnose();
    return NextResponse.json({
      ok: true,
      message: "Public schema reset. Trigger a new deploy so `prisma migrate deploy` applies the schema cleanly.",
      ...diagnosis,
    });
  } catch (err) {
    console.error("fix-migration reset failed:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
