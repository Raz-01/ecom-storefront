import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";

/**
 * One-off repair endpoint. The initial schema migration was applied to
 * Postgres by hand (see CLAUDE.md "Environment quirk" — the dev sandbox
 * this was built in had unreliable outbound access to Neon), and the
 * connection died partway through — enum types were created but the
 * CREATE TABLE statements after them never ran. This inspects what
 * actually exists and applies whichever migration.sql statements are
 * still missing, tolerating "already exists" on ones that aren't (e.g.
 * the enum types), then marks the migration finished in
 * `_prisma_migrations` — everything `prisma migrate resolve --applied`
 * plus the actual DDL would have done, run from inside a Vercel
 * serverless function, the one place in this saga with reliable Postgres
 * connectivity.
 *
 * GET returns a diagnostic (what tables/types exist) without changing
 * anything. POST applies the fix. Same secret-gating as `/api/admin/seed`;
 * safe to remove once no longer needed.
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
  const migrations = await prisma.$queryRawUnsafe<{ migration_name: string; finished_at: Date | null }[]>(
    `SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at`,
  );
  return { tables: tables.map((t) => t.tablename), types: types.map((t) => t.typname), migrations };
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

  const migrationSqlPath = path.join(
    process.cwd(),
    "prisma",
    "migrations",
    "20260907131411_init_ilorin_bulk_mart",
    "migration.sql",
  );

  try {
    const sql = readFileSync(migrationSqlPath, "utf8");
    // Strip Prisma's "-- CreateTable" style comment lines first — splitting
    // on ";" alone would otherwise leave each statement chunk starting with
    // one of those, wrongly filterable as "just a comment".
    const withoutComments = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");
    const statements = withoutComments
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const applied: string[] = [];
    const skipped: { statement: string; reason: string }[] = [];

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement + ";");
        applied.push(statement.slice(0, 60));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Already-exists errors are expected for whatever partially applied
        // before the connection died — safe to skip and keep going.
        if (/already exists/i.test(message)) {
          skipped.push({ statement: statement.slice(0, 60), reason: "already exists" });
          continue;
        }
        throw err;
      }
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = $1 WHERE migration_name = $2 AND finished_at IS NULL`,
      applied.length,
      "20260907131411_init_ilorin_bulk_mart",
    );

    const diagnosis = await diagnose();
    return NextResponse.json({ ok: true, appliedCount: applied.length, skippedCount: skipped.length, skipped, ...diagnosis });
  } catch (err) {
    console.error("fix-migration route failed:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
