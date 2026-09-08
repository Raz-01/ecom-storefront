import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { QuoteStatus } from "@prisma/client";

const STATUS_TONE: Record<QuoteStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  NEW: "info",
  CONTACTED: "warning",
  QUOTED: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "neutral",
};

export default async function AdminQuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  await requirePermission("quotes:manage");
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? (sp.status as QuoteStatus) : undefined;

  const quotes = await prisma.quoteRequest.findMany({
    where: status ? { status } : {},
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Quote requests</h1>

      <form action="/admin/quotes" className="flex items-center gap-2">
        <Select name="status" defaultValue={status ?? ""} className="w-48">
          <option value="">All statuses</option>
          {(["NEW", "CONTACTED", "QUOTED", "ACCEPTED", "REJECTED", "EXPIRED"] as const).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <Table>
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>Customer</Th>
            <Th>Items</Th>
            <Th>Date</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {quotes.map((quote) => (
            <Tr key={quote.id}>
              <Td>
                <Link href={`/admin/quotes/${quote.quoteNumber}`} className="font-medium hover:underline">
                  #{quote.quoteNumber}
                </Link>
              </Td>
              <Td>
                <div>{quote.customerName}</div>
                <div className="text-xs text-stone-500">{quote.customerPhone}</div>
              </Td>
              <Td className="text-xs text-stone-500">{quote.items.length} product(s)</Td>
              <Td className="text-xs text-stone-500">{quote.createdAt.toLocaleDateString()}</Td>
              <Td>
                <Badge tone={STATUS_TONE[quote.status]}>{quote.status}</Badge>
              </Td>
            </Tr>
          ))}
          {quotes.length === 0 && (
            <Tr>
              <Td colSpan={5} className="py-8 text-center text-sm text-stone-500">
                No quote requests match this filter.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
