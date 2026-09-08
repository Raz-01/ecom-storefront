import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildQuoteWhatsAppLink } from "@/lib/whatsapp";
import { buttonClasses } from "@/components/ui/Button";

export default async function QuoteConfirmationPage({ params }: PageProps<"/quote/[quoteNumber]">) {
  const { quoteNumber } = await params;
  const quote = await prisma.quoteRequest.findUnique({ where: { quoteNumber }, include: { items: true } });
  if (!quote) notFound();

  const whatsappLink = buildQuoteWhatsAppLink({
    quoteNumber: quote.quoteNumber,
    deliveryState: quote.deliveryState,
    message: quote.message,
    items: quote.items.map((i) => ({ productName: i.productName, quantity: i.quantity })),
  });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <h1 className="text-lg font-semibold">Quote request received</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Reference #{quote.quoteNumber}. We&apos;ll get back to you shortly — sending it on WhatsApp gets you a faster response.</p>
      </div>

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 text-sm font-semibold">Requested products</h2>
        <ul className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {quote.items.map((item) => (
            <li key={item.id}>
              {item.quantity}× {item.productName}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`flex-1 text-center ${buttonClasses("whatsapp", "lg")}`}>
          Send on WhatsApp
        </a>
        <Link href="/shop" className={`flex-1 text-center ${buttonClasses("outline", "lg")}`}>
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
