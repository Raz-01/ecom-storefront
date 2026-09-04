import { z } from "zod";

/**
 * The subset of business config that is safe to read from client
 * components (product cards, cart, etc.) — no secrets. Kept separate from
 * `config.ts` because Next.js only inlines env vars into the client bundle
 * when they're referenced as literal `process.env.NEXT_PUBLIC_*`
 * expressions; anything reading `process.env.DATABASE_URL` or similar
 * would evaluate to `undefined` in the browser and fail validation there.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_BUSINESS_NAME: z.string().min(1).default("Demo Store"),
  // E.164 international format without the leading "+", e.g. "2348012345678".
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{10,15}$/, "WHATSAPP number must be digits only, in international format without '+'")
    .default("2340000000000"),
  NEXT_PUBLIC_CURRENCY: z.string().length(3).default("NGN"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_BUSINESS_NAME: process.env.NEXT_PUBLIC_BUSINESS_NAME,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsed.success) {
  console.error("Invalid public environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid public environment configuration. Check your .env file against .env.example.");
}

const env = parsed.data;

export const publicConfig = {
  business: {
    name: env.NEXT_PUBLIC_BUSINESS_NAME,
    whatsappNumber: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },
  currency: env.NEXT_PUBLIC_CURRENCY,
  appUrl: env.NEXT_PUBLIC_APP_URL,
} as const;
