import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed/runSeed";

const prisma = new PrismaClient();

runSeed(prisma)
  .then((result) => {
    console.log(
      `Seeded ${result.adminCount} admin users, ${result.categoryCount} categories, ${result.productCount} products, ${result.deliveryZoneCount} delivery zones.`,
    );
    if (result.ordersSeeded) console.log(`Seeded ${result.ordersSeeded} historical orders.`);
    if (result.quotesSeeded) console.log(`Seeded ${result.quotesSeeded} quote requests.`);
    console.log(`\nDemo admin logins:`);
    for (const login of result.demoLogins) {
      console.log(`  ${login.role.padEnd(16)} ${login.email} / ${login.password}`);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
