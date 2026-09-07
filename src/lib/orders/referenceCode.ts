import { businessConfig } from "@/lib/business.config";

/**
 * Generates a short, human-friendly reference code, e.g. "IBL-20260904-A3F9"
 * — used for both order numbers and quote numbers so customers can quote a
 * consistent format over WhatsApp or a phone call. Not a database sequence
 * (no coordination needed across concurrent requests); collision risk is
 * handled by the caller retrying on a unique-constraint violation — see
 * `withUniqueReferenceRetry`.
 */
export function generateReferenceCode(date: Date = new Date()): string {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${businessConfig.referenceCodePrefix}-${datePart}-${randomPart}`;
}

/**
 * Retries `create` a few times if it fails on a reference-code unique
 * constraint collision (Prisma error P2002 on the given field) — cheap
 * insurance against the rare case of two requests generating the same
 * random suffix in the same second, without needing a coordinated sequence.
 */
export async function withUniqueReferenceRetry<T>(
  create: (referenceCode: string) => Promise<T>,
  field: string,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await create(generateReferenceCode());
    } catch (err) {
      lastError = err;
      if (!isUniqueConstraintError(err, field)) throw err;
    }
  }
  throw lastError;
}

function isUniqueConstraintError(err: unknown, field: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002" &&
    "meta" in err &&
    !!(err as { meta?: { target?: string[] } }).meta?.target?.includes(field)
  );
}
