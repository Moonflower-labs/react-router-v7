import { prisma } from "~/db.server";

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true }
  });
}
