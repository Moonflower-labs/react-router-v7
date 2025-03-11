import { prisma } from "~/db.server";

interface ShippingRate {
  id?: string;
  displayName: string;
  amount: number;
  metadata?: Record<string, string>;
}

export async function createShippinRate({ displayName, amount, metadata }: ShippingRate) {
  return prisma.shippingRate.create({ data: { displayName, amount, metadata } });
}
export async function editShippinRate({ id, displayName, amount, metadata }: ShippingRate) {
  return prisma.shippingRate.update({ where: { id }, data: { displayName, amount, metadata } });
}
export async function getShippinRates() {
  return prisma.shippingRate.findMany();
}

export async function getShippinRate(id: string) {
  return prisma.shippingRate.findUnique({ where: { id } });
}

export async function deleteShippinRate(id: string) {
  return prisma.shippingRate.delete({ where: { id } });
}
