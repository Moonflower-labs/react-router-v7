import type { Password, Plan, User as PrismaUser, Profile, ShippingAddress, Subscription } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { createCustomer } from "~/integrations/stripe/customer.server";
import { type SubscriptionPlan } from "~/integrations/stripe/subscription.server";

export interface User extends PrismaUser {
  profile: Profile | null;
  shippingAddress?: ShippingAddress[];
  subscription?: UserSubscription | null;
}

interface UserSubscription extends Subscription {
  plan: Plan;
}

// id, username, email,
// profile.avatar, subscription.id, plan.name

export async function getUserById(id: User["id"] | undefined) {
  if (!id) return null;
  return await prisma.user.findUnique({
    where: { id },
    include: {
      profile: { select: { avatar: true } }, // Only avatar needed
      shippingAddress: true,
      subscription: { include: { plan: { select: { name: true } } } }
    }
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByCustomerId(customerId: User["customerId"]) {
  return prisma.user.findFirst({ where: { customerId } });
}

export async function createUser(email: User["email"], password: string, username: User["username"]) {
  const hashedPassword = await bcrypt.hash(password, 10);
  // create a Stripe customer
  await createCustomer(email, username);
  return prisma.user.create({
    data: {
      username,
      email,
      password: {
        create: {
          hash: hashedPassword
        }
      },
      profile: { create: {} }
    }
  });
}

export async function deleteUser(id: User["id"]) {
  return prisma.user.delete({ where: { id } });
}

export async function getUsers() {
  return await prisma.user.findMany({
    include: { subscription: { include: { plan: true } }, profile: { select: { avatar: true } } }
  });
}

export async function verifyLogin(email: User["email"], password: Password["hash"]) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true
    }
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function updateUserCustomerId(userId: string, customerId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      customerId
    }
  });
}

export function getUserDiscount(plan: SubscriptionPlan["name"] | undefined) {
  if (!plan) return 0;
  return plan === "Espíritu" ? 15 : plan === "Alma" ? 10 : plan === "Personalidad" ? 5 : 0;
}

export async function getUsersCount() {
  return prisma.user.count();
}

export async function getMembersCount() {
  return prisma.subscription.count({
    where: {
      status: "active"
    }
  });
}

export async function getUsersByPlan(plan: SubscriptionPlan["name"]) {
  return prisma.user.findMany({
    where: {
      subscription: {
        plan: {
          name: plan
        },
        status: "active"
      }
    },
    select: {
      email: true,
      username: true
    }
  });
}
