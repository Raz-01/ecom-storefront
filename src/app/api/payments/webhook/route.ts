import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature, getPaystackSecretKeyOrThrow } from "@/lib/payments/paystack";
import { markPaymentSuccess, markPaymentFailed } from "@/lib/orders/confirmPayment";

type PaystackWebhookEvent = {
  event: string;
  data?: { reference?: string; amount?: number };
};

/**
 * Paystack webhook (https://paystack.com/docs/payments/webhooks/) — the
 * authoritative, server-to-server confirmation of payment, independent of
 * whether the customer's browser ever makes it back to `/checkout/callback`
 * (they might close the tab, lose connectivity, etc.). Must read the raw
 * body for signature verification before any JSON parsing.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  let secretKey: string;
  try {
    secretKey = getPaystackSecretKeyOrThrow();
  } catch {
    // Demo mode — there's no real Paystack account to send webhooks, so
    // this endpoint has nothing to do.
    return NextResponse.json({ error: "Paystack is not configured" }, { status: 404 });
  }

  if (!verifyPaystackWebhookSignature(rawBody, signature, secretKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    if (event.event === "charge.success") {
      await markPaymentSuccess({ reference, amountMinor: event.data?.amount ?? 0, rawResponse: event as never });
    } else if (event.event === "charge.failed") {
      await markPaymentFailed({ reference, rawResponse: event as never });
    }
    // Other event types (transfer events, etc.) are ignored.
  } catch (err) {
    // Logged for investigation, but still acknowledged below — Paystack
    // retries non-2xx responses, and retrying won't fix a missing payment
    // record or one already in a terminal state.
    console.error("paystack webhook: failed to update payment", reference, err);
  }

  return NextResponse.json({ received: true });
}
