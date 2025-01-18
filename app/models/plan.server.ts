import { prisma } from "~/db.server";

export async function getSubscriptionPlan(id: string) {
  return await prisma.plan.findUnique({ where: { id } });
}

interface CreateSubscriptionPlanArgs {
  id: string;
  name: string;
  priceId: string;
  subscriptionId?: string;
}

export async function createSubscriptionPlan({
  id,
  name,
  priceId
}: CreateSubscriptionPlanArgs) {
  return await prisma.plan.create({ data: { id, name, priceId } });
}

// model Plan {
//   id      String @id @default(cuid())
//   name    String
//   priceId String

//   createdAt    DateTime       @default(now())
//   updatedAt    DateTime       @updatedAt
//   subscription Subscription[]
// }
