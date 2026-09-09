import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { formatMoney } from "@/lib/currency";
import { businessConfig } from "@/lib/business.config";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { getDisplayPaymentStatus, getDisplayFulfillmentStatus } from "@/lib/orders/status";
import { PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/domain/OrderStatusBadges";
import { PrintButton } from "@/components/site/PrintButton";
import { buttonClasses } from "@/components/ui/Button";
import { retryPayment } from "./actions";

const STATUS_COPY: Record<string, { title: string; body: string; tone: "success" | "pending" | "error" }> = {
  PAID: { title: "Payment received", body: "Thanks! We've got your order and will start preparing it.", tone: "success" },
  PROCESSING: { title: "Payment received", body: "Thanks! We've got your order and will start preparing it.", tone: "success" },
  PENDING_PAYMENT: { title: "Awaiting payment", body: "We haven't received your payment yet. If you already paid, this will update shortly.", tone: "pending" },
  PAYMENT_PROCESSING: { title: "Payment processing", body: "We're confirming your payment. This page will update shortly.", tone: "pending" },
  READY_FOR_PICKUP: { title: "Ready for pickup", body: "Your order is ready to collect from our warehouse.", tone: "success" },
  OUT_FOR_DELIVERY: { title: "Out for delivery", body: "Your order is on its way.", tone: "success" },
  COMPLETED: { title: "Order completed", body: "This order has been delivered/collected. Thanks for shopping with us!", tone: "success" },
  CANCELLED: { title: "Order cancelled", body: "This order was cancelled.", tone: "error" },
};

export default async function OrderConfirmationPage({ params }: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const status = STATUS_COPY[order.status] ?? { title: order.status, body: "", tone: "pending" as const };
  const latestPayment = order.payments[0];
  const paymentStatus = getDisplayPaymentStatus(order, latestPayment?.status);
  const fulfillmentStatus = getDisplayFulfillmentStatus(order);
  const canRetryPayment = paymentStatus !== "PAID" && order.status !== "CANCELLED";

  const whatsappLink = buildOrderWhatsAppLink({
    orderNumber: order.orderNumber,
    totalMinor: order.totalMinor,
    fulfillmentMethod: order.fulfillmentMethod,
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((i) => ({ productName: i.productName, quantity: i.quantity, packageSize: i.packageSize })),
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{businessConfig.name}</p>
          <h1 className="text-lg font-semibold">Order #{order.orderNumber}</h1>
        </div>
        <div className="flex gap-2">
          <PaymentStatusBadge status={paymentStatus} />
          <FulfillmentStatusBadge status={fulfillmentStatus} />
        </div>
      </div>

      <div
        className={`rounded-lg border p-4 ${
          status.tone === "success"
            ? "border-green-200 bg-green-50"
            : status.tone === "error"
              ? "border-red-200 bg-red-50"
              : "border-amber-200 bg-amber-50"
        }`}
      >
        <h2 className="text-base font-semibold">{status.title}</h2>
        <p className="mt-1 text-sm text-stone-600">{status.body}</p>
        {canRetryPayment && (
          <form action={retryPayment.bind(null, order.orderNumber)} className="no-print mt-3">
            <button type="submit" className={buttonClasses("primary", "sm")}>
              {latestPayment?.status === "FAILED" ? "Retry payment" : "Pay now"}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-lg border border-stone-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Order details</h2>
          <span className="text-xs text-stone-500">{order.createdAt.toLocaleString(businessConfig.locale)}</span>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-stone-600">
              <span>
                {item.quantity}× {item.productName} <span className="text-xs">({item.packageSize})</span>
              </span>
              <span>{formatMoney(item.lineTotalMinor)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-1 border-t border-stone-200 pt-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotalMinor)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>{order.fulfillmentMethod === "PICKUP" ? "Pickup" : "Delivery"}</span>
            <span>{order.fulfillmentMethod === "PICKUP" ? "Free" : formatMoney(order.deliveryFeeMinor)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.totalMinor)}</span>
          </div>
        </div>
        {order.fulfillmentMethod === "DELIVERY" ? (
          <p className="mt-3 text-sm text-stone-600">
            Delivering to: {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState}
            {order.deliveryLandmark ? ` (near ${order.deliveryLandmark})` : ""}
          </p>
        ) : (
          <p className="mt-3 text-sm text-stone-600">Pickup from: {businessConfig.location.address}</p>
        )}
      </div>

      <div className="no-print flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center ${buttonClasses("whatsapp", "lg")}`}>
          Continue on WhatsApp
        </a>
        <PrintButton />
        <Link href="/shop" className={`flex-1 text-center ${buttonClasses("outline", "lg")}`}>
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
