import crypto from "node:crypto";
import { config } from "@/lib/config";
import type {
  InitializeTransactionInput,
  InitializeTransactionResult,
  PaymentProvider,
  VerifyTransactionResult,
} from "@/lib/payments/types";

const PAYSTACK_API_BASE = "https://api.paystack.co";

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: { authorization_url: string; access_code: string; reference: string };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: { status: "success" | "failed" | "abandoned"; reference: string; amount: number; gateway_response: string };
};

/** Real Paystack integration (https://paystack.com/docs/api/transaction/). */
export class PaystackProvider implements PaymentProvider {
  readonly name = "paystack";

  constructor(private readonly secretKey: string) {}

  async initializeTransaction(input: InitializeTransactionInput): Promise<InitializeTransactionResult> {
    const res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amountMinor,
        reference: input.reference,
        callback_url: input.callbackUrl,
      }),
    });

    const body = (await res.json()) as PaystackInitializeResponse;
    if (!res.ok || !body.status || !body.data) {
      throw new Error(`Paystack initialize failed: ${body.message ?? res.statusText}`);
    }

    return { authorizationUrl: body.data.authorization_url, reference: body.data.reference };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    const res = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });

    const body = (await res.json()) as PaystackVerifyResponse;
    if (!res.ok || !body.status || !body.data) {
      return { status: "pending", reference };
    }

    if (body.data.status === "success") {
      return { status: "success", reference, amountMinor: body.data.amount };
    }
    if (body.data.status === "failed" || body.data.status === "abandoned") {
      return { status: "failed", reference, reason: body.data.gateway_response };
    }
    return { status: "pending", reference };
  }
}

/**
 * Verifies the `x-paystack-signature` header on an incoming webhook
 * request using the raw request body, per Paystack's HMAC-SHA512 scheme.
 * Must be run against the raw (unparsed) body — JSON.stringify(parsedBody)
 * is not guaranteed to match the original bytes.
 */
export function verifyPaystackWebhookSignature(rawBody: string, signatureHeader: string | null, secretKey: string): boolean {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function getPaystackSecretKeyOrThrow(): string {
  if (config.payments.isPaystackDemoMode || !config.payments.paystackSecretKey) {
    throw new Error("Paystack secret key is not configured");
  }
  return config.payments.paystackSecretKey;
}
