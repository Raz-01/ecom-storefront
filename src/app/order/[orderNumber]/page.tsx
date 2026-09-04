import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { formatMoney } from "@/lib/currency";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";

const STATUS_COPY: Record<string, { title: string; body: string; tone: "success" | "pending" | "error" }> = {
  PAID: { title: "Payment received", body: "Thanks! We've got your order and will start preparing it.", tone: "success" },
  PENDING_PAYMENT: { title: "Awaiting payment", body: "We haven't received your payment yet. If you already paid, this will update shortly.", tone: "pending" },
  PAYMENT_FAILED: { title: "Payment failed", body: "Your payment didn't go through, so this order wasn't confirmed. No stock was held.", tone: "error" },
  CANCELLED: { title: "Order cancelled", body: "This order was cancelled.", tone: "error" },
  FULFILLED: { title: "Order fulfilled", body: "This order has been delivered. Thanks for shopping with us!", tone: "success" },
};

export default async function OrderConfirmationPage({ params }: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const status = STATUS_COPY[order.status] ?? { title: order.status, body: "", tone: "pending" as const };
  const whatsappLink = buildOrderWhatsAppLink({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalMinor: order.totalMinor,
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div
        className={`rounded-lg border p-4 ${
          status.tone === "success"
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
            : status.tone === "error"
              ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
              : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
        }`}
      >
        <h1 className="text-lg font-semibold">{status.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{status.body}</p>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Order {order.orderNumber}</h2>
          <span className="text-xs text-zinc-500">{order.createdAt.toLocaleString()}</span>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>
                {item.quantity}× {item.productName}
              </span>
              <span>{formatMoney(item.lineTotalMinor)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotalMinor)}</span>
          </div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Delivery ({order.deliveryZone.name})</span>
            <span>{formatMoney(order.deliveryFeeMinor)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.totalMinor)}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Delivering to: {order.deliveryAddress}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-green-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-700"
        >
          Continue on WhatsApp
        </a>
        <Link href="/" className="flex-1 rounded-full border border-zinc-300 px-5 py-2.5 text-center text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
