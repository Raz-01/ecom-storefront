/**
 * Central business identity/configuration.
 *
 * Every value here that is specific to the real business — name, contact
 * details, address, brand colors — is read from here, never hardcoded in a
 * component or route. This is the single place to update before this goes
 * from demo to a real deployed store.
 *
 * Contains no secrets, so it's safe to import from both server and client
 * components. Secrets (DATABASE_URL, PAYSTACK_SECRET_KEY, session secret)
 * live in `env.server.ts` instead — importing that module from a client
 * component would crash the browser bundle.
 *
 * Values marked PLACEHOLDER are safe demo defaults and must be replaced
 * with real business information before this goes live.
 */
export const businessConfig = {
  name: "Ilorin Bulk Mart",
  shortName: "IBM",
  /** Prefix used for order and quote numbers, e.g. "IBL-20260904-A3F9". */
  referenceCodePrefix: "IBL",
  tagline: "Buy Foodstuff in Bulk. Get Better Value. Delivered Across Nigeria.",
  description:
    "Ilorin Bulk Mart supplies branded, packaged foodstuff in bulk, including rice, beans, flour, semovita, cooking oil, noodles, pasta and spices, to individuals, retailers, restaurants and distributors across Nigeria, sourced directly from manufacturers.",

  location: {
    city: "Ilorin",
    state: "Kwara State",
    country: "Nigeria",
    // PLACEHOLDER — replace with the real warehouse/pickup address.
    address: "Warehouse Address, Ilorin, Kwara State, Nigeria",
  },

  contact: {
    // PLACEHOLDER — Nigerian phone numbers, E.164 with leading "+".
    phone: "+2348000000000",
    // PLACEHOLDER — WhatsApp number in international format, digits only,
    // no leading "+" (this is what wa.me links require).
    whatsapp: "2348000000000",
    // PLACEHOLDER
    email: "hello@ilorinbulkmart.demo",
  },

  currency: "NGN",
  currencySymbol: "₦", // ₦
  locale: "en-NG",

  brand: {
    // PLACEHOLDER — set once a real logo exists.
    logoUrl: null as string | null,
    colors: {
      // Deep green + warm gold: a wholesale/grain-market palette rather
      // than a generic SaaS blue-and-white.
      primary: "#0F7A3D",
      primaryDark: "#0B5C2D",
      accent: "#E7B008",
    },
  },

  social: {
    instagram: null as string | null,
    facebook: null as string | null,
    twitter: null as string | null,
  },

  delivery: {
    nationwide: true,
    /**
     * Fallback delivery fee (minor units) for a state with no explicit
     * `DeliveryZone` row — see `lib/delivery`. Keeps checkout from ever
     * showing "no delivery fee available" for an unconfigured state.
     */
    defaultFeeMinor: 500_000, // ₦5,000
  },

  inventory: {
    defaultLowStockThreshold: 10,
  },

  /** Minimum cart quantity (per line) before a customer should consider requesting a quote instead of checking out instantly. Purely a UI nudge — actual per-product thresholds live on `Product.bulkQuoteThreshold`. */
  bulkQuoteNudgeQuantity: 20,
} as const;

export type BusinessConfig = typeof businessConfig;
