import type {
  Password,
  User as PrismaUser,
  Profile,
  ShippingAddress
} from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { createCustomer } from "~/integrations/stripe";

export interface User extends PrismaUser {
  profile: Profile | null;
  shippingAddress: ShippingAddress[];
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true, shippingAddress: true }
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByCustomerId(customerId: User["customerId"]) {
  return prisma.user.findFirst({ where: { customerId } });
}

export async function createUser(
  email: User["email"],
  password: string,
  username: User["username"]
) {
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

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true
    }
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

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
