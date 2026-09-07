import { z } from "zod";

/**
 * Server-only environment/secrets validation. Never import this from a
 * "use client" component — DATABASE_URL and the Paystack/session secrets
 * below are not `NEXT_PUBLIC_*`, so Next.js won't inline them into the
 * client bundle, and this module would throw in the browser trying to
 * validate values that evaluate to `undefined` there. Public, non-secret
 * runtime config (business identity, currency, etc.) lives in
 * `business.config.ts` instead, which is safe for client import.
 *
 * Missing required values fail fast at startup with a clear error rather
 * than surfacing as a confusing runtime bug later.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),

  // Signs admin session JWTs (Auth.js). A long random string — generate
  // with `openssl rand -base64 32`. Falls back to a fixed demo value only
  // so local dev doesn't need setup friction; that fallback must never be
  // used in a real deployment.
  AUTH_SECRET: z
    .string()
    .min(16)
    .default("DEMO_PLACEHOLDER_AUTH_SECRET_DO_NOT_USE_IN_PRODUCTION"),

  // Gates the one-off `/api/admin/seed` route (see that file for why it
  // exists). Optional: the route 404s entirely when this isn't set.
  SEED_SECRET: z.string().min(16).optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration. Check your .env file against .env.example.");
}

const env = parsed.data;

if (env.AUTH_SECRET.startsWith("DEMO_PLACEHOLDER") && process.env.VERCEL_ENV === "production") {
  throw new Error(
    "AUTH_SECRET is still the demo placeholder in a production deployment. Set a real secret via `vercel env add AUTH_SECRET`.",
  );
}

/** True when no real Paystack secret key is configured — see `lib/payments`. */
const isPaystackDemoMode =
  !env.PAYSTACK_SECRET_KEY || env.PAYSTACK_SECRET_KEY.startsWith("DEMO_PLACEHOLDER");

export const serverEnv = {
  databaseUrl: env.DATABASE_URL,
  appUrl: env.NEXT_PUBLIC_APP_URL,
  authSecret: env.AUTH_SECRET,
  seedSecret: env.SEED_SECRET,
  payments: {
    isPaystackDemoMode,
    paystackSecretKey: env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: env.PAYSTACK_PUBLIC_KEY,
  },
} as const;
