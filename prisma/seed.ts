import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Demo catalog/delivery data for local development and demos. Prices are
 * in kobo (NGN minor units — see schema comment on Product.priceMinor).
 * Replace with real data (or a proper admin/import flow) before launch.
 */
const categories = [
  { name: "Skincare", slug: "skincare" },
  { name: "Haircare", slug: "haircare" },
  { name: "Fragrance", slug: "fragrance" },
] as const;

const products = [
  {
    name: "Hydrating Facial Cleanser",
    slug: "hydrating-facial-cleanser",
    description: "A gentle, sulfate-free cleanser that removes impurities without stripping moisture.",
    priceMinor: 850_000, // ₦8,500.00
    stock: 40,
    categorySlug: "skincare",
  },
  {
    name: "Vitamin C Brightening Serum",
    slug: "vitamin-c-brightening-serum",
    description: "10% Vitamin C serum that evens out skin tone and fades dark spots over time.",
    priceMinor: 1_450_000, // ₦14,500.00
    stock: 25,
    categorySlug: "skincare",
  },
  {
    name: "SPF 50 Daily Sunscreen",
    slug: "spf-50-daily-sunscreen",
    description: "Lightweight, non-greasy broad-spectrum sunscreen for everyday wear.",
    priceMinor: 950_000, // ₦9,500.00
    stock: 60,
    categorySlug: "skincare",
  },
  {
    name: "Shea Butter Deep Conditioner",
    slug: "shea-butter-deep-conditioner",
    description: "Rich, weekly deep conditioning treatment for dry and damaged hair.",
    priceMinor: 750_000, // ₦7,500.00
    stock: 35,
    categorySlug: "haircare",
  },
  {
    name: "Rice Water Strengthening Shampoo",
    slug: "rice-water-strengthening-shampoo",
    description: "Fortifying shampoo that reduces breakage and adds shine.",
    priceMinor: 680_000, // ₦6,800.00
    stock: 45,
    categorySlug: "haircare",
  },
  {
    name: "Lightweight Hair Growth Oil",
    slug: "lightweight-hair-growth-oil",
    description: "A fast-absorbing blend of castor and rosemary oil for scalp health.",
    priceMinor: 600_000, // ₦6,000.00
    stock: 50,
    categorySlug: "haircare",
  },
  {
    name: "Amber & Oud Eau de Parfum",
    slug: "amber-oud-eau-de-parfum",
    description: "A warm, long-lasting unisex fragrance with amber, oud and vanilla notes.",
    priceMinor: 2_500_000, // ₦25,000.00
    stock: 15,
    categorySlug: "fragrance",
  },
  {
    name: "Citrus Bloom Body Mist",
    slug: "citrus-bloom-body-mist",
    description: "A light, refreshing everyday body mist with citrus and white floral notes.",
    priceMinor: 550_000, // ₦5,500.00
    stock: 0, // seeded out of stock, so the UI's out-of-stock state has a real example
    categorySlug: "fragrance",
  },
] as const;

const deliveryZones = [
  { name: "Lagos Mainland", feeMinor: 150_000 }, // ₦1,500.00
  { name: "Lagos Island", feeMinor: 200_000 }, // ₦2,000.00
  { name: "Other States (via courier)", feeMinor: 350_000 }, // ₦3,500.00
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceMinor: product.priceMinor,
        stock: product.stock,
        categoryId: category.id,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceMinor: product.priceMinor,
        stock: product.stock,
        categoryId: category.id,
      },
    });
  }

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: { name: zone.name },
      update: { feeMinor: zone.feeMinor, isActive: true },
      create: zone,
    });
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products, ${deliveryZones.length} delivery zones.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
