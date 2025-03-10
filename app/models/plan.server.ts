import { prisma } from "~/db.server";

export async function getSubscriptionPlan(id: string) {
  return await prisma.plan.findUnique({ where: { id } });
}

interface CreateSubscriptionPlanArgs {
  id: string;
  name: string;
  priceId: string;
  amount: number;
  subscriptionId?: string;
  thumbnail?: string;
}

export async function createSubscriptionPlan({ id, name, priceId, amount, thumbnail }: CreateSubscriptionPlanArgs) {
  return await prisma.plan.create({ data: { id, name, priceId, amount, thumbnail } });
}

export async function getAllPlans() {
  return prisma.plan.findMany({});
}
