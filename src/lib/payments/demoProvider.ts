import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import type {
  InitializeTransactionInput,
  InitializeTransactionResult,
  PaymentProvider,
  VerifyTransactionResult,
} from "@/lib/payments/types";

/**
 * Simulated payment provider used when no real Paystack secret key is
 * configured (see `config.payments.isPaystackDemoMode`). It sends the
 * customer to an in-app page (`/pay/demo/[reference]`) that stands in for
 * Paystack's hosted checkout, where they can simulate a success or
 * failure. That page updates the order directly; `verifyTransaction` here
 * simply reads back what was recorded, so the surrounding checkout/verify
 * flow is identical to the real Paystack path and can be swapped in
 * without touching route or UI code — only the env vars change.
 */
export class DemoPaymentProvider implements PaymentProvider {
  readonly name = "demo";

  async initializeTransaction(input: InitializeTransactionInput): Promise<InitializeTransactionResult> {
    return {
      authorizationUrl: `${config.appUrl}/pay/demo/${encodeURIComponent(input.reference)}`,
      reference: input.reference,
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
    const order = await prisma.order.findUnique({ where: { orderNumber: reference } });
    if (!order) return { status: "pending", reference };

    if (order.status === "PAID") {
      return { status: "success", reference, amountMinor: order.totalMinor };
    }
    if (order.status === "PAYMENT_FAILED") {
      return { status: "failed", reference, reason: "Simulated failure" };
    }
    return { status: "pending", reference };
  }
}
