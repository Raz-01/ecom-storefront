import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/currency";
import { businessConfig } from "@/lib/business.config";
import { Button } from "@/components/ui/Button";
import { simulateSuccess, simulateFailure } from "./actions";

/**
 * Stand-in for Paystack's hosted checkout page, used when no real Paystack
 * secret key is configured (see `DemoPaymentProvider`). Lets a developer or
 * demo viewer walk the full checkout → payment → confirmation flow without
 * real payment credentials.
 */
export default async function DemoPaymentPage({ params }: PageProps<"/pay/demo/[reference]">) {
  const { reference } = await params;
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: true } });
  if (!payment) notFound();

  if (payment.status !== "PENDING") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-zinc-500">This payment attempt has already been processed.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-16 sm:px-6">
      <div className="w-full rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Demo payment</p>
        <h1 className="text-lg font-semibold">Pay {formatMoney(payment.amountMinor)}</h1>
        <p className="mt-1 text-sm text-zinc-500">Order #{payment.order.orderNumber}</p>
        <p className="mt-4 text-xs text-zinc-500">
          No real payment provider is configured for {businessConfig.name}, so this simulates Paystack&apos;s checkout. Choose an outcome below.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <form action={simulateSuccess.bind(null, reference)}>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Simulate successful payment
            </Button>
          </form>
          <form action={simulateFailure.bind(null, reference)}>
            <Button type="submit" variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              Simulate failed payment
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
