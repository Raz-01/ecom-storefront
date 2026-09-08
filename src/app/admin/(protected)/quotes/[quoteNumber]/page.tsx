import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { buildCustomerContactWhatsAppLink } from "@/lib/whatsapp";
import { businessConfig } from "@/lib/business.config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { QuoteUpdateForm } from "@/components/admin/QuoteUpdateForm";

export default async function AdminQuoteDetailPage({ params }: PageProps<"/admin/quotes/[quoteNumber]">) {
  await requirePermission("quotes:manage");
  const { quoteNumber } = await params;

  const quote = await prisma.quoteRequest.findUnique({
    where: { quoteNumber },
    include: { items: true, handledBy: { select: { name: true } } },
  });
  if (!quote) notFound();

  const whatsappMessage = `Hello ${quote.customerName}, this is ${businessConfig.name} following up on your bulk quote request #${quote.quoteNumber}.`;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Quote #{quote.quoteNumber}</h1>
        <p className="text-sm text-zinc-500">{quote.createdAt.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Requested products</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {quote.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}× {item.productName}
                </li>
              ))}
            </ul>
            {quote.message && (
              <div className="mt-3 border-t border-zinc-200 pt-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                <p className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">Message from customer</p>
                {quote.message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{quote.customerName}</span>
              <span className="text-zinc-500">{quote.customerPhone}</span>
              {quote.customerEmail && <span className="text-zinc-500">{quote.customerEmail}</span>}
              {quote.deliveryState && (
                <span className="text-zinc-500">
                  {quote.deliveryCity ? `${quote.deliveryCity}, ` : ""}
                  {quote.deliveryState}
                </span>
              )}
              <a href={buildCustomerContactWhatsAppLink(quote.customerWhatsapp, whatsappMessage)} target="_blank" rel="noopener noreferrer" className={`mt-2 ${buttonClasses("whatsapp", "sm")}`}>
                Contact on WhatsApp
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status &amp; notes</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteUpdateForm quoteNumber={quote.quoteNumber} currentStatus={quote.status} currentNotes={quote.adminNotes ?? ""} />
              {quote.handledBy && <p className="mt-2 text-xs text-zinc-500">Last handled by {quote.handledBy.name}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
