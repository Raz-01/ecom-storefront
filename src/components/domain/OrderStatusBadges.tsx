import { Badge } from "@/components/ui/Badge";
import type { DisplayFulfillmentStatus, DisplayPaymentStatus } from "@/lib/orders/status";

const PAYMENT_TONE: Record<DisplayPaymentStatus, "success" | "warning" | "danger"> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "danger",
};

const PAYMENT_LABEL: Record<DisplayPaymentStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
};

export function PaymentStatusBadge({ status }: { status: DisplayPaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{PAYMENT_LABEL[status]}</Badge>;
}

const FULFILLMENT_TONE: Record<DisplayFulfillmentStatus, "neutral" | "info" | "success" | "danger"> = {
  AWAITING_PAYMENT: "neutral",
  PROCESSING: "info",
  READY_FOR_PICKUP: "info",
  OUT_FOR_DELIVERY: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const FULFILLMENT_LABEL: Record<DisplayFulfillmentStatus, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function FulfillmentStatusBadge({ status }: { status: DisplayFulfillmentStatus }) {
  return <Badge tone={FULFILLMENT_TONE[status]}>{FULFILLMENT_LABEL[status]}</Badge>;
}
