import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";
import { runSeed } from "@/lib/seed/runSeed";

/**
 * One-off, secret-gated seed endpoint. Exists solely because this project
 * was built and migrated from a sandbox whose outbound network to the
 * database was unreliable, while Vercel's own network to it was fine —
 * running `prisma db seed` locally wasn't an option, so seeding runs here
 * instead, on Vercel's infrastructure, triggered by one authenticated
 * request after deploy.
 *
 * Gated on `SEED_SECRET` (unset in most environments, so this 404s by
 * default rather than existing as a live no-auth endpoint) and callable
 * only via POST with a matching `x-seed-secret` header. Consider removing
 * this route once seeding is no longer needed this way, or once real admin
 * data-management tooling makes it redundant.
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
    const result = await runSeed(prisma);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("seed route failed:", err);
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
