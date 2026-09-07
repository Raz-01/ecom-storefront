import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";

/**
 * One-off repair endpoint. The initial schema migration was applied to
 * Postgres by hand (see CLAUDE.md "Environment quirk" — the dev sandbox
 * this was built in had unreliable outbound access to Neon), which left
 * Prisma's `_prisma_migrations` tracking table out of sync: a build-time
 * `prisma migrate deploy` recorded a failed attempt (P3018, "type already
 * exists") and now refuses to proceed (P3009) until that's resolved.
 *
 * This does exactly what `prisma migrate resolve --applied` would, via a
 * plain UPDATE, from inside a Vercel serverless function — the one place
 * in this whole saga with actually-reliable Postgres connectivity.
 *
 * Same secret-gating as `/api/admin/seed`; safe to remove once no longer
 * needed.
 */
export async function POST(request: NextRequest) {
  if (!serverEnv.seedSecret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const providedSecret = request.headers.get("x-seed-secret");
  if (providedSecret !== serverEnv.seedSecret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const before: unknown = await prisma.$queryRawUnsafe(
      `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`,
    );

    const result: unknown = await prisma.$executeRawUnsafe(
      `UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = 1 WHERE migration_name = $1 AND finished_at IS NULL`,
      "20260907131411_init_ilorin_bulk_mart",
    );

    const after: unknown = await prisma.$queryRawUnsafe(
      `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`,
    );

    return NextResponse.json({ ok: true, rowsUpdated: result, before, after });
  } catch (err) {
    console.error("fix-migration route failed:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
