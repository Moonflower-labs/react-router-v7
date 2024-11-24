import { PrismaClient } from "@prisma/client";
import { syncStripeProducts } from "~/models/cart.server";

const prisma = new PrismaClient();

async function seed() {
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await syncStripeProducts();
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
