import { prisma } from "~/db.server";

export type UserSubscription = Awaited<ReturnType<typeof getUserSubscription>>;

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true }
  });
}
export async function getSubscription(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    include: { plan: true }
  });
}
