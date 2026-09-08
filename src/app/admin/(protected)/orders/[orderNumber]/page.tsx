import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { getDisplayPaymentStatus, getDisplayFulfillmentStatus } from "@/lib/orders/status";
import { formatMoney } from "@/lib/currency";
import { buildCustomerContactWhatsAppLink } from "@/lib/whatsapp";
import { businessConfig } from "@/lib/business.config";
import { PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/domain/OrderStatusBadges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[orderNumber]">) {
  const session = await requirePermission("orders:view");
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();

  const paymentStatus = getDisplayPaymentStatus(order, order.payments[0]?.status);
  const fulfillmentStatus = getDisplayFulfillmentStatus(order);
  const canManage = hasPermission(session.user.role, "orders:manage");
  const canChangeFulfillment = ["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED"].includes(order.status);

  const whatsappMessage = `Hello ${order.customerName}, this is ${businessConfig.name} regarding your order #${order.orderNumber}.`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-stone-500">{order.createdAt.toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <PaymentStatusBadge status={paymentStatus} />
          <FulfillmentStatusBadge status={fulfillmentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}× {item.productName} <span className="text-xs text-stone-500">({item.packageSize}, SKU {item.productSku})</span>
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
                <span>{formatMoney(order.deliveryFeeMinor)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.totalMinor)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{order.customerName}</span>
              <span className="text-stone-500">{order.customerPhone}</span>
              {order.customerEmail && <span className="text-stone-500">{order.customerEmail}</span>}
              <a href={buildCustomerContactWhatsAppLink(order.customerWhatsapp, whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`mt-2 ${buttonClasses("whatsapp", "sm")}`}>
                Contact on WhatsApp
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{order.fulfillmentMethod === "PICKUP" ? "Pickup" : "Delivery"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-stone-600">
              {order.fulfillmentMethod === "PICKUP" ? (
                <p>Collecting from {businessConfig.location.address}</p>
              ) : (
                <p>
                  {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState}
                  {order.deliveryLandmark ? ` (near ${order.deliveryLandmark})` : ""}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between">
                    <span className="text-stone-600">
                      {payment.provider} · {payment.createdAt.toLocaleString()}
                    </span>
                    <Badge tone={payment.status === "SUCCESS" ? "success" : payment.status === "FAILED" ? "danger" : "warning"}>{payment.status}</Badge>
                  </li>
                ))}
                {order.payments.length === 0 && <p className="text-stone-500">No payment attempts yet.</p>}
              </ul>
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Update status</CardTitle>
              </CardHeader>
              <CardContent>
                {canChangeFulfillment ? (
                  <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status === "PAID" ? "PROCESSING" : order.status} />
                ) : (
                  <p className="text-sm text-stone-500">This order isn&apos;t paid yet — fulfillment status can&apos;t be changed until payment is confirmed.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
