import { prisma } from "~/db.server";

export async function getShippinRates() {
  return prisma.shippingRate.findMany();
}

export async function getShippinRate(id: string) {
  return prisma.shippingRate.findUnique({ where: { id } });
}
