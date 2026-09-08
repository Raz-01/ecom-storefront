import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { markPaymentSuccess, markPaymentFailed } from "@/lib/orders/confirmPayment";

/**
 * Where Paystack (or the demo provider) redirects the customer back after
 * a hosted-checkout payment attempt. This is the redirect-driven path for
 * confirming payment; the webhook (`/api/payments/webhook`) is the
 * authoritative, server-to-server path — `markPaymentSuccess`/
 * `markPaymentFailed` are idempotent so whichever fires first wins and the
 * other is a no-op.
 */
export async function GET(request: NextRequest) {
  // Paystack sends both `reference` and `trxref` (same value) on redirect.
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  if (!reference) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: true } });
  if (!payment) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const provider = getPaymentProvider();
  try {
    const result = await provider.verifyTransaction(reference);
    if (result.status === "success") {
      await markPaymentSuccess({ reference, amountMinor: result.amountMinor });
    } else if (result.status === "failed") {
      await markPaymentFailed({ reference });
    }
    // "pending" — leave it as-is; a later webhook or refresh resolves it.
  } catch (err) {
    console.error("checkout callback: failed to verify/update payment", reference, err);
  }

  return NextResponse.redirect(new URL(`/order/${payment.order.orderNumber}`, request.url));
}
