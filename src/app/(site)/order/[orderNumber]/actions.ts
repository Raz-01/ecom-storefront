"use server";

import { redirect } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders/getOrder";
import { initiatePayment } from "@/lib/orders/initiatePayment";
import { serverEnv } from "@/lib/env.server";

/** Starts a fresh payment attempt on an existing PENDING_PAYMENT order — e.g. after a failed attempt — without re-creating the order or re-validating stock/pricing from scratch. */
export async function retryPayment(orderNumber: string) {
  const order = await getOrderByNumber(orderNumber);
  if (!order) throw new Error(`Order ${orderNumber} not found`);
  if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_PROCESSING") {
    throw new Error(`Order ${orderNumber} is not awaiting payment`);
  }

  const email = order.customerEmail || `${order.orderNumber.toLowerCase()}@guest.${new URL(serverEnv.appUrl).hostname}`;
  const init = await initiatePayment(order, email);
  redirect(init.authorizationUrl);
}
