import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { formatMoney } from "@/lib/currency";
import { simulateSuccess, simulateFailure } from "./actions";

/**
 * Stand-in for Paystack's hosted checkout page, used when no real Paystack
 * secret key is configured (see `DemoPaymentProvider`). Lets a developer or
 * demo viewer walk the full checkout → payment → confirmation flow without
 * real payment credentials.
 */
export default async function DemoPaymentPage({ params }: PageProps<"/pay/demo/[reference]">) {
  const { reference } = await params;
  const order = await getOrderByNumber(reference);
  if (!order) notFound();

  if (order.status !== "PENDING_PAYMENT") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-zinc-500">This order has already been processed.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-16 sm:px-6">
      <div className="w-full rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Demo payment</p>
        <h1 className="text-lg font-semibold">Pay {formatMoney(order.totalMinor)}</h1>
        <p className="mt-1 text-sm text-zinc-500">Order {order.orderNumber}</p>
        <p className="mt-4 text-xs text-zinc-500">
          No real payment provider is configured, so this simulates Paystack&apos;s checkout. Choose an outcome below.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <form action={simulateSuccess.bind(null, reference)}>
            <button type="submit" className="w-full rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700">
              Simulate successful payment
            </button>
          </form>
          <form action={simulateFailure.bind(null, reference)}>
            <button type="submit" className="w-full rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
              Simulate failed payment
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
