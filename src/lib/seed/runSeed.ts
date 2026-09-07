import type { PrismaClient, PackageType } from "@prisma/client";
import bcrypt from "bcryptjs";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

/** Demo credentials — printed/returned at the end of the seed run. Not real accounts; rotate/remove before going live. */
const ADMIN_USERS = [
  { name: "Amina Yusuf", email: "owner@ilorinbulkmart.demo", password: "Owner123!", role: "OWNER" as const },
  { name: "Bashir Adeyemi", email: "admin@ilorinbulkmart.demo", password: "Admin123!", role: "ADMIN" as const },
  { name: "Chidinma Okoro", email: "warehouse@ilorinbulkmart.demo", password: "Warehouse123!", role: "WAREHOUSE_STAFF" as const },
];

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { name: "Rice", slug: "rice", description: "Bagged rice in bulk quantities." },
  { name: "Beans", slug: "beans", description: "Sacked beans varieties." },
  { name: "Garri", slug: "garri", description: "White and yellow garri." },
  { name: "Flour", slug: "flour", description: "Bagged wheat flour." },
  { name: "Semovita", slug: "semovita", description: "Packaged semolina/semovita." },
  { name: "Cooking Oil", slug: "cooking-oil", description: "Palm oil and groundnut oil in bulk." },
  { name: "Noodles & Pasta", slug: "noodles-pasta", description: "Carton quantities of instant noodles and pasta." },
  { name: "Spices", slug: "spices", description: "Bulk packaged spices and seasoning." },
] as const;

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  brand: string;
  categorySlug: (typeof CATEGORIES)[number]["slug"];
  packageType: PackageType;
  packageSize: string;
  priceMinor: number;
  /** Stock actually received into the warehouse — historical orders below draw down from this; see stock reconciliation further down. */
  receivedStock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  bulkQuoteThreshold?: number;
  bulkPrices?: { minQuantity: number; pricePerUnitMinor: number }[];
  isFeatured?: boolean;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Royal Stallion Rice 50kg",
    slug: "royal-stallion-rice-50kg",
    sku: "RICE-RS-50",
    description: "Premium long-grain parboiled rice, packed in a 50kg bag. Our best-selling bulk rice.",
    brand: "Royal Stallion",
    categorySlug: "rice",
    packageType: "BAG",
    packageSize: "50kg Bag",
    priceMinor: 5_500_000,
    receivedStock: 60,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
    bulkQuoteThreshold: 50,
    bulkPrices: [
      { minQuantity: 10, pricePerUnitMinor: 5_400_000 },
      { minQuantity: 25, pricePerUnitMinor: 5_300_000 },
    ],
    isFeatured: true,
  },
  {
    name: "Royal Stallion Rice 25kg",
    slug: "royal-stallion-rice-25kg",
    sku: "RICE-RS-25",
    description: "Premium long-grain parboiled rice, packed in a 25kg bag.",
    brand: "Royal Stallion",
    categorySlug: "rice",
    packageType: "BAG",
    packageSize: "25kg Bag",
    priceMinor: 2_900_000,
    receivedStock: 80,
    lowStockThreshold: 15,
    minOrderQuantity: 1,
  },
  {
    name: "Mama Gold Rice 50kg",
    slug: "mama-gold-rice-50kg",
    sku: "RICE-MG-50",
    description: "Well-milled, stone-free parboiled rice in a 50kg bag.",
    brand: "Mama Gold",
    categorySlug: "rice",
    packageType: "BAG",
    packageSize: "50kg Bag",
    priceMinor: 5_300_000,
    receivedStock: 30,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
    isFeatured: true,
  },
  {
    name: "Honey Beans 50kg",
    slug: "honey-beans-50kg",
    sku: "BEANS-HB-50",
    description: "Clean, well-sorted honey beans (oloyin), sacked at 50kg.",
    brand: "Local Grade A",
    categorySlug: "beans",
    packageType: "SACK",
    packageSize: "50kg Sack",
    priceMinor: 4_800_000,
    receivedStock: 25,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
    bulkQuoteThreshold: 30,
    bulkPrices: [{ minQuantity: 10, pricePerUnitMinor: 4_700_000 }],
  },
  {
    name: "Drum Beans 50kg",
    slug: "drum-beans-50kg",
    sku: "BEANS-DR-50",
    description: "Brown drum/oloyin-mix beans, sacked at 50kg.",
    brand: "Local Grade A",
    categorySlug: "beans",
    packageType: "SACK",
    packageSize: "50kg Sack",
    priceMinor: 4_500_000,
    receivedStock: 22,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
  },
  {
    name: "White Garri 50kg",
    slug: "white-garri-50kg",
    sku: "GARRI-WH-50",
    description: "Fine-sifted white garri, sacked at 50kg.",
    brand: "Ijebu Grade",
    categorySlug: "garri",
    packageType: "SACK",
    packageSize: "50kg Sack",
    priceMinor: 3_200_000,
    receivedStock: 18,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
  },
  {
    name: "Yellow Garri 25kg",
    slug: "yellow-garri-25kg",
    sku: "GARRI-YL-25",
    description: "Fried yellow garri, sacked at 25kg.",
    brand: "Ijebu Grade",
    categorySlug: "garri",
    packageType: "SACK",
    packageSize: "25kg Sack",
    priceMinor: 1_750_000,
    receivedStock: 2, // deliberately sized to sell out via seeded order history — see reconciliation below
    lowStockThreshold: 10,
    minOrderQuantity: 1,
  },
  {
    name: "Honeywell Flour 50kg",
    slug: "honeywell-flour-50kg",
    sku: "FLOUR-HW-50",
    description: "All-purpose wheat flour, bagged at 50kg.",
    brand: "Honeywell",
    categorySlug: "flour",
    packageType: "BAG",
    packageSize: "50kg Bag",
    priceMinor: 4_200_000,
    receivedStock: 35,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
  },
  {
    name: "Mama Gold Flour 25kg",
    slug: "mama-gold-flour-25kg",
    sku: "FLOUR-MG-25",
    description: "All-purpose wheat flour, bagged at 25kg.",
    brand: "Mama Gold",
    categorySlug: "flour",
    packageType: "BAG",
    packageSize: "25kg Bag",
    priceMinor: 2_150_000,
    receivedStock: 50,
    lowStockThreshold: 15,
    minOrderQuantity: 1,
  },
  {
    name: "Golden Penny Semovita 10kg",
    slug: "golden-penny-semovita-10kg",
    sku: "SEMO-GP-10",
    description: "Smooth semolina/semovita, packed at 10kg.",
    brand: "Golden Penny",
    categorySlug: "semovita",
    packageType: "PACK",
    packageSize: "10kg Pack",
    priceMinor: 900_000,
    receivedStock: 55,
    lowStockThreshold: 15,
    minOrderQuantity: 1,
  },
  {
    name: "Golden Penny Semovita 5kg",
    slug: "golden-penny-semovita-5kg",
    sku: "SEMO-GP-5",
    description: "Smooth semolina/semovita, packed at 5kg.",
    brand: "Golden Penny",
    categorySlug: "semovita",
    packageType: "PACK",
    packageSize: "5kg Pack",
    priceMinor: 480_000,
    receivedStock: 16, // deliberately sized to end up low-stock — see reconciliation below
    lowStockThreshold: 15,
    minOrderQuantity: 1,
  },
  {
    name: "Devon Kings Palm Oil 25L",
    slug: "devon-kings-palm-oil-25l",
    sku: "OIL-PALM-25",
    description: "Refined palm oil in a 25-litre keg.",
    brand: "Devon Kings",
    categorySlug: "cooking-oil",
    packageType: "BOTTLE",
    packageSize: "25L Keg",
    priceMinor: 3_800_000,
    receivedStock: 20,
    lowStockThreshold: 8,
    minOrderQuantity: 1,
    isFeatured: true,
  },
  {
    name: "Kings Groundnut Oil 25L",
    slug: "kings-groundnut-oil-25l",
    sku: "OIL-GNUT-25",
    description: "Pure groundnut oil in a 25-litre keg.",
    brand: "Kings",
    categorySlug: "cooking-oil",
    packageType: "BOTTLE",
    packageSize: "25L Keg",
    priceMinor: 4_100_000,
    receivedStock: 14,
    lowStockThreshold: 8,
    minOrderQuantity: 1,
  },
  {
    name: "Indomie Instant Noodles (Carton of 40)",
    slug: "indomie-instant-noodles-carton",
    sku: "NOODLE-INDO-40",
    description: "Chicken-flavour instant noodles, a full carton of 40 sachets.",
    brand: "Indomie",
    categorySlug: "noodles-pasta",
    packageType: "CARTON",
    packageSize: "Carton of 40",
    priceMinor: 1_150_000,
    receivedStock: 120,
    lowStockThreshold: 20,
    minOrderQuantity: 1,
    isFeatured: true,
  },
  {
    name: "Dangote Spaghetti (Carton of 20)",
    slug: "dangote-spaghetti-carton",
    sku: "PASTA-DANG-20",
    description: "Durum wheat spaghetti, a full carton of 20 packs.",
    brand: "Dangote",
    categorySlug: "noodles-pasta",
    packageType: "CARTON",
    packageSize: "Carton of 20",
    priceMinor: 980_000,
    receivedStock: 75,
    lowStockThreshold: 15,
    minOrderQuantity: 1,
  },
  {
    name: "Assorted Bulk Spice Pack",
    slug: "assorted-bulk-spice-pack",
    sku: "SPICE-MIX-CTN",
    description: "A carton of assorted seasoning cubes, curry, thyme and pepper, packed for resale.",
    brand: "Local Grade A",
    categorySlug: "spices",
    packageType: "CARTON",
    packageSize: "Carton",
    priceMinor: 650_000,
    receivedStock: 28,
    lowStockThreshold: 10,
    minOrderQuantity: 1,
  },
];

// ---------------------------------------------------------------------------
// Delivery zones — flat fee per state, distance-banded from Ilorin, Kwara
// ---------------------------------------------------------------------------

const DELIVERY_ZONES = [
  { state: "Kwara", feeMinor: 250_000 },
  { state: "Oyo", feeMinor: 350_000 },
  { state: "Ogun", feeMinor: 450_000 },
  { state: "Lagos", feeMinor: 500_000 },
  { state: "FCT", feeMinor: 450_000 },
  { state: "Kaduna", feeMinor: 600_000 },
  { state: "Kano", feeMinor: 700_000 },
  { state: "Rivers", feeMinor: 750_000 },
] as const;

// ---------------------------------------------------------------------------
// Historical orders — drives both Order/OrderItem/Payment seed data and the
// InventoryMovement ledger (see reconciliation below). Listed oldest first.
// ---------------------------------------------------------------------------

type OrderScenario = {
  daysAgo: number;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  fulfillmentMethod: "PICKUP" | "DELIVERY";
  deliveryState?: (typeof DELIVERY_ZONES)[number]["state"];
  deliveryCity?: string;
  deliveryAddress?: string;
  items: { sku: string; quantity: number }[];
  /** Only meaningful for PENDING_PAYMENT — whether to seed a failed prior attempt (retry scenario). */
  failedAttempt?: boolean;
};

const ORDER_SCENARIOS: OrderScenario[] = [
  {
    daysAgo: 45,
    status: "COMPLETED",
    customerName: "Tunde Bakare",
    customerPhone: "+2348031112222",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "Lagos",
    deliveryCity: "Ikeja",
    deliveryAddress: "14 Allen Avenue, Ikeja",
    items: [
      { sku: "RICE-RS-50", quantity: 2 },
      { sku: "OIL-PALM-25", quantity: 1 },
    ],
  },
  {
    daysAgo: 40,
    status: "COMPLETED",
    customerName: "Blessing Eze",
    customerPhone: "+2348022223333",
    fulfillmentMethod: "PICKUP",
    items: [{ sku: "NOODLE-INDO-40", quantity: 5 }],
  },
  {
    daysAgo: 35,
    status: "COMPLETED",
    customerName: "Ibrahim Suleiman",
    customerPhone: "+2348033334444",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "Kwara",
    deliveryCity: "Ilorin",
    deliveryAddress: "22 Fate Road, Ilorin",
    items: [{ sku: "RICE-MG-50", quantity: 1 }],
  },
  {
    daysAgo: 30,
    status: "CANCELLED",
    customerName: "Ngozi Chukwu",
    customerPhone: "+2348044445555",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "Oyo",
    deliveryCity: "Ibadan",
    deliveryAddress: "9 Ring Road, Ibadan",
    items: [{ sku: "BEANS-HB-50", quantity: 3 }],
  },
  {
    daysAgo: 6,
    status: "OUT_FOR_DELIVERY",
    customerName: "Femi Adekunle",
    customerPhone: "+2348055556666",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "Ogun",
    deliveryCity: "Abeokuta",
    deliveryAddress: "5 Panseke Street, Abeokuta",
    items: [
      { sku: "GARRI-YL-25", quantity: 2 },
      { sku: "FLOUR-HW-50", quantity: 2 },
    ],
  },
  {
    daysAgo: 4,
    status: "READY_FOR_PICKUP",
    customerName: "Halima Bello",
    customerPhone: "+2348066667777",
    fulfillmentMethod: "PICKUP",
    items: [{ sku: "SEMO-GP-10", quantity: 10 }],
  },
  {
    daysAgo: 2,
    status: "PROCESSING",
    customerName: "Emeka Okafor",
    customerPhone: "+2348077778888",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "FCT",
    deliveryCity: "Abuja",
    deliveryAddress: "Plot 12, Gwarinpa",
    items: [{ sku: "RICE-RS-25", quantity: 4 }],
  },
  {
    daysAgo: 1,
    status: "PAID",
    customerName: "Grace Umeh",
    customerPhone: "+2348088889999",
    fulfillmentMethod: "PICKUP",
    items: [{ sku: "PASTA-DANG-20", quantity: 6 }],
  },
  {
    daysAgo: 0,
    status: "PENDING_PAYMENT",
    customerName: "Yusuf Garba",
    customerPhone: "+2348099990000",
    fulfillmentMethod: "DELIVERY",
    deliveryState: "Kano",
    deliveryCity: "Kano",
    deliveryAddress: "3 Zoo Road, Kano",
    items: [{ sku: "OIL-GNUT-25", quantity: 1 }],
    failedAttempt: true,
  },
  {
    daysAgo: 0,
    status: "PENDING_PAYMENT",
    customerName: "Aisha Mohammed",
    customerPhone: "+2348011110000",
    fulfillmentMethod: "PICKUP",
    items: [{ sku: "SPICE-MIX-CTN", quantity: 2 }],
  },
];

const PAID_STATUSES = new Set(["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"]);

// ---------------------------------------------------------------------------
// Quote requests
// ---------------------------------------------------------------------------

type QuoteScenario = {
  daysAgo: number;
  status: "NEW" | "CONTACTED" | "QUOTED" | "ACCEPTED" | "REJECTED";
  customerName: string;
  customerPhone: string;
  deliveryState?: string;
  message?: string;
  items: { sku: string; quantity: number }[];
  adminNotes?: string;
  handledByEmail?: string;
};

const QUOTE_SCENARIOS: QuoteScenario[] = [
  {
    daysAgo: 10,
    status: "ACCEPTED",
    customerName: "Restaurant Deluxe Ltd",
    customerPhone: "+2348012340001",
    deliveryState: "Kwara",
    message: "Monthly standing order for our restaurant chain.",
    items: [
      { sku: "RICE-RS-50", quantity: 60 },
      { sku: "OIL-PALM-25", quantity: 10 },
    ],
    adminNotes: "Agreed ₦5,250,000/bag for 60+ bags. First delivery scheduled.",
    handledByEmail: "admin@ilorinbulkmart.demo",
  },
  {
    daysAgo: 7,
    status: "QUOTED",
    customerName: "Supermart Express",
    customerPhone: "+2348012340002",
    deliveryState: "Lagos",
    items: [{ sku: "BEANS-HB-50", quantity: 40 }],
    adminNotes: "Sent quote via WhatsApp — awaiting confirmation.",
    handledByEmail: "admin@ilorinbulkmart.demo",
  },
  {
    daysAgo: 3,
    status: "CONTACTED",
    customerName: "Kunle's Provisions",
    customerPhone: "+2348012340003",
    deliveryState: "Oyo",
    message: "Need pricing for a large noodles order ahead of the festive season.",
    items: [{ sku: "NOODLE-INDO-40", quantity: 200 }],
    handledByEmail: "admin@ilorinbulkmart.demo",
  },
  {
    daysAgo: 1,
    status: "NEW",
    customerName: "Northgate Distributors",
    customerPhone: "+2348012340004",
    deliveryState: "Kaduna",
    message: "Please advise best price for a truckload of mixed grains.",
    items: [
      { sku: "RICE-MG-50", quantity: 100 },
      { sku: "GARRI-WH-50", quantity: 50 },
    ],
  },
  {
    daysAgo: 15,
    status: "REJECTED",
    customerName: "Budget Foods",
    customerPhone: "+2348012340005",
    deliveryState: "Ogun",
    items: [{ sku: "FLOUR-MG-25", quantity: 20 }],
    adminNotes: "Requested price below cost — declined.",
    handledByEmail: "admin@ilorinbulkmart.demo",
  },
];

export type SeedResult = {
  adminCount: number;
  categoryCount: number;
  productCount: number;
  deliveryZoneCount: number;
  ordersSeeded: number;
  quotesSeeded: number;
  demoLogins: { role: string; email: string; password: string }[];
};

/**
 * Idempotent-ish demo data seed. Catalog/zones/admins are always upserted
 * (safe to re-run); historical orders and quotes are only created once
 * (skipped if any already exist) since replaying them would duplicate
 * order history and double-deduct stock.
 */
export async function runSeed(prisma: PrismaClient): Promise<SeedResult> {
  // --- Admin users ---
  const adminIdByEmail = new Map<string, string>();
  for (const admin of ADMIN_USERS) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    const record = await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: { name: admin.name, role: admin.role, passwordHash },
      create: { name: admin.name, email: admin.email, role: admin.role, passwordHash },
    });
    adminIdByEmail.set(admin.email, record.id);
  }

  // --- Categories ---
  const categoryBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categoryBySlug.set(category.slug, record.id);
  }

  // --- Products (created with receivedStock; reconciled down to realistic levels below) ---
  const productBySku = new Map<string, { id: string; priceMinor: number; stock: number }>();
  for (const product of PRODUCTS) {
    const categoryId = categoryBySlug.get(product.categorySlug)!;
    const record = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: product.brand,
        categoryId,
        packageType: product.packageType,
        packageSize: product.packageSize,
        priceMinor: product.priceMinor,
        stock: product.receivedStock,
        lowStockThreshold: product.lowStockThreshold,
        minOrderQuantity: product.minOrderQuantity,
        bulkQuoteThreshold: product.bulkQuoteThreshold,
        isActive: true,
        isFeatured: product.isFeatured ?? false,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        brand: product.brand,
        categoryId,
        packageType: product.packageType,
        packageSize: product.packageSize,
        priceMinor: product.priceMinor,
        stock: product.receivedStock,
        lowStockThreshold: product.lowStockThreshold,
        minOrderQuantity: product.minOrderQuantity,
        bulkQuoteThreshold: product.bulkQuoteThreshold,
        isFeatured: product.isFeatured ?? false,
      },
    });
    productBySku.set(product.sku, { id: record.id, priceMinor: record.priceMinor, stock: record.stock });

    for (const tier of product.bulkPrices ?? []) {
      await prisma.bulkPrice.upsert({
        where: { productId_minQuantity: { productId: record.id, minQuantity: tier.minQuantity } },
        update: { pricePerUnitMinor: tier.pricePerUnitMinor },
        create: { productId: record.id, minQuantity: tier.minQuantity, pricePerUnitMinor: tier.pricePerUnitMinor },
      });
    }

    const alreadyHasHistory = await prisma.inventoryMovement.findFirst({
      where: { productId: record.id, reason: "STOCK_RECEIVED" },
    });
    if (!alreadyHasHistory) {
      await prisma.inventoryMovement.create({
        data: {
          productId: record.id,
          quantityChange: product.receivedStock,
          previousQuantity: 0,
          newQuantity: product.receivedStock,
          reason: "STOCK_RECEIVED",
          note: "Initial warehouse stock intake",
          createdAt: daysAgo(60),
        },
      });
    }
  }

  // --- Delivery zones ---
  const deliveryZoneByState = new Map<string, string>();
  for (const zone of DELIVERY_ZONES) {
    const record = await prisma.deliveryZone.upsert({
      where: { state: zone.state },
      update: { feeMinor: zone.feeMinor, isActive: true },
      create: zone,
    });
    deliveryZoneByState.set(zone.state, record.id);
  }

  // --- Historical orders ---
  const existingOrderCount = await prisma.order.count();
  if (existingOrderCount === 0) {
    for (const scenario of ORDER_SCENARIOS) {
      const createdAt = daysAgo(scenario.daysAgo);
      const paidAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

      const lines = scenario.items.map((item) => {
        const product = productBySku.get(item.sku)!;
        const productMeta = PRODUCTS.find((p) => p.sku === item.sku)!;
        return {
          productId: product.id,
          productName: productMeta.name,
          productSku: productMeta.sku,
          packageSize: productMeta.packageSize,
          unitPriceMinor: product.priceMinor,
          quantity: item.quantity,
          lineTotalMinor: product.priceMinor * item.quantity,
        };
      });
      const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
      const deliveryZoneId = scenario.deliveryState ? deliveryZoneByState.get(scenario.deliveryState) ?? null : null;
      const deliveryFeeMinor =
        scenario.fulfillmentMethod === "DELIVERY" ? DELIVERY_ZONES.find((z) => z.state === scenario.deliveryState)!.feeMinor : 0;
      const totalMinor = subtotalMinor + deliveryFeeMinor;

      const orderNumber = `IBL-${createdAt.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerName: scenario.customerName,
          customerPhone: scenario.customerPhone,
          customerWhatsapp: scenario.customerPhone,
          fulfillmentMethod: scenario.fulfillmentMethod,
          deliveryZoneId,
          deliveryState: scenario.deliveryState ?? null,
          deliveryCity: scenario.deliveryCity ?? null,
          deliveryAddress: scenario.deliveryAddress ?? null,
          deliveryFeeMinor,
          subtotalMinor,
          totalMinor,
          status: scenario.status,
          stockRestored: scenario.status === "CANCELLED",
          createdAt,
          updatedAt: PAID_STATUSES.has(scenario.status) ? paidAt : createdAt,
          items: { create: lines },
        },
      });

      if (scenario.failedAttempt) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: "paystack",
            reference: `${orderNumber}-ATTEMPT-1`,
            amountMinor: totalMinor,
            status: "FAILED",
            createdAt: new Date(createdAt.getTime() + 5 * 60 * 1000),
          },
        });
      }

      if (PAID_STATUSES.has(scenario.status)) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: scenario.daysAgo % 2 === 0 ? "paystack" : "demo",
            reference: orderNumber,
            amountMinor: totalMinor,
            status: "SUCCESS",
            paidAt,
            createdAt: paidAt,
          },
        });

        for (const line of lines) {
          const product = productBySku.get(line.productSku)!;
          const newQuantity = product.stock - line.quantity;
          await prisma.product.update({ where: { id: product.id }, data: { stock: newQuantity } });
          await prisma.inventoryMovement.create({
            data: {
              productId: product.id,
              quantityChange: -line.quantity,
              previousQuantity: product.stock,
              newQuantity,
              reason: "ORDER_PLACED",
              orderId: order.id,
              createdAt: paidAt,
            },
          });
          product.stock = newQuantity;
        }

        if (scenario.status === "CANCELLED") {
          const cancelledAt = new Date(paidAt.getTime() + 2 * DAY_MS);
          for (const line of lines) {
            const product = productBySku.get(line.productSku)!;
            const newQuantity = product.stock + line.quantity;
            await prisma.product.update({ where: { id: product.id }, data: { stock: newQuantity } });
            await prisma.inventoryMovement.create({
              data: {
                productId: product.id,
                quantityChange: line.quantity,
                previousQuantity: product.stock,
                newQuantity,
                reason: "ORDER_CANCELLED",
                orderId: order.id,
                createdAt: cancelledAt,
              },
            });
            product.stock = newQuantity;
          }
        }
      }
    }
  }

  // --- Quote requests ---
  const existingQuoteCount = await prisma.quoteRequest.count();
  if (existingQuoteCount === 0) {
    for (const scenario of QUOTE_SCENARIOS) {
      const createdAt = daysAgo(scenario.daysAgo);
      const quoteNumber = `IBL-Q-${createdAt.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const items = scenario.items.map((item) => {
        const product = productBySku.get(item.sku)!;
        const productMeta = PRODUCTS.find((p) => p.sku === item.sku)!;
        return { productId: product.id, productName: productMeta.name, quantity: item.quantity };
      });

      await prisma.quoteRequest.create({
        data: {
          quoteNumber,
          customerName: scenario.customerName,
          customerPhone: scenario.customerPhone,
          customerWhatsapp: scenario.customerPhone,
          deliveryState: scenario.deliveryState,
          message: scenario.message,
          status: scenario.status,
          adminNotes: scenario.adminNotes,
          handledById: scenario.handledByEmail ? adminIdByEmail.get(scenario.handledByEmail) : undefined,
          createdAt,
          updatedAt: createdAt,
          items: { create: items },
        },
      });
    }
  }

  return {
    adminCount: ADMIN_USERS.length,
    categoryCount: CATEGORIES.length,
    productCount: PRODUCTS.length,
    deliveryZoneCount: DELIVERY_ZONES.length,
    ordersSeeded: existingOrderCount === 0 ? ORDER_SCENARIOS.length : 0,
    quotesSeeded: existingQuoteCount === 0 ? QUOTE_SCENARIOS.length : 0,
    demoLogins: ADMIN_USERS.map((a) => ({ role: a.role, email: a.email, password: a.password })),
  };
}
