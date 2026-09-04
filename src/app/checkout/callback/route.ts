import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { markOrderPaid, markOrderFailed } from "@/lib/orders/confirmPayment";

/**
 * Where Paystack (or the demo provider) redirects the customer back after
 * a real hosted-checkout payment attempt. This is the redirect-driven path
 * for confirming payment; the webhook (`/api/payments/webhook`) is the
 * authoritative, server-to-server path — `markOrderPaid`/`markOrderFailed`
 * are idempotent so whichever fires first wins and the other is a no-op.
 */
export async function GET(request: NextRequest) {
  // Paystack sends both `reference` and `trxref` (same value) on redirect.
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  if (!reference) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const provider = getPaymentProvider();

  try {
    const result = await provider.verifyTransaction(reference);
    if (result.status === "success") {
      await markOrderPaid({ orderNumber: reference, paymentReference: reference, paymentProvider: provider.name });
    } else if (result.status === "failed") {
      await markOrderFailed({ orderNumber: reference, paymentReference: reference, paymentProvider: provider.name });
    }
    // "pending" — leave the order as-is; a later webhook or refresh resolves it.
  } catch (err) {
    console.error("checkout callback: failed to verify/update order", reference, err);
  }

  return NextResponse.redirect(new URL(`/order/${reference}`, request.url));
}
