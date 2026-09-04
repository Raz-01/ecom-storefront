/**
 * Generates a short, human-friendly order number (e.g. "ORD-4K7QX2"),
 * distinct from the internal cuid `id`, suitable for customers to quote
 * over WhatsApp or a phone call.
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const datePart = date
    .toISOString()
    .slice(2, 10) // YY-MM-DD
    .replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}
