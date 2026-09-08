"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import type { QuoteStatus } from "@prisma/client";

export type UpdateQuoteState = { error?: string };

const VALID_STATUSES: QuoteStatus[] = ["NEW", "CONTACTED", "QUOTED", "ACCEPTED", "REJECTED", "EXPIRED"];

export async function updateQuote(quoteNumber: string, _prevState: UpdateQuoteState, formData: FormData): Promise<UpdateQuoteState> {
  const session = await requirePermission("quotes:manage");

  const status = formData.get("status") as QuoteStatus;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Select a valid status." };
  }

  try {
    await prisma.quoteRequest.update({
      where: { quoteNumber },
      data: { status, adminNotes, handledById: session.user.id },
    });
  } catch (err) {
    console.error("updateQuote failed:", err);
    return { error: "Something went wrong updating this quote." };
  }

  revalidatePath(`/admin/quotes/${quoteNumber}`);
  revalidatePath("/admin/quotes");
  return {};
}
