import { getActiveDeliveryZones } from "@/lib/catalog";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const deliveryZones = await getActiveDeliveryZones();

  return (
    <main className="flex flex-1 flex-col">
      {deliveryZones.length === 0 ? (
        <p className="mx-auto w-full max-w-3xl px-4 py-16 text-center text-sm text-zinc-500 sm:px-6">
          Delivery isn&apos;t available right now. Please check back later.
        </p>
      ) : (
        <CheckoutForm deliveryZones={deliveryZones.map((z) => ({ id: z.id, name: z.name, feeMinor: z.feeMinor }))} />
      )}
    </main>
  );
}
