import { z } from "zod";
import { publicConfig } from "@/lib/publicConfig";

/**
 * Central, validated business configuration — server-only (includes
 * secrets, so this module must never be imported from a "use client"
 * component; use `publicConfig` there instead). Every value specific to
 * the real business is read from the environment here — never hardcoded
 * in route handlers or server actions. Missing required values fail fast
 * at startup with a clear error instead of surfacing as a confusing
 * runtime bug later.
 *
 * Values marked "DEMO PLACEHOLDER" in .env.example are safe defaults for
 * local development only and must be replaced before going live.
 */

const serverEnvSchema = z.object({
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  DATABASE_URL: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check your .env file against .env.example.");
}

const env = parsed.data;

/**
 * True when no real Paystack secret key is configured. In this mode the
 * app uses an in-app simulated payment provider so checkout can be built,
 * demoed and tested end-to-end before real credentials exist.
 */
const isPaystackDemoMode =
  !env.PAYSTACK_SECRET_KEY || env.PAYSTACK_SECRET_KEY.startsWith("DEMO_PLACEHOLDER");

export const config = {
  business: publicConfig.business,
  currency: publicConfig.currency,
  appUrl: publicConfig.appUrl,
  payments: {
    isPaystackDemoMode,
    paystackSecretKey: env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: env.PAYSTACK_PUBLIC_KEY,
  },
} as const;
