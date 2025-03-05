import { prisma } from "~/db.server";

import type { Product as Prod, Price } from "@prisma/client";

export interface Product extends Prod {
  prices: Price[];
}

export async function getAllProducts() {
  return prisma.product.findMany({ include: { prices: true } });
}

export async function getProduct(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      prices: true,
      reviews: { include: { user: { select: { username: true } } } }
    }
  });
}

export async function getPrice(priceId: string) {
  return prisma.price.findUnique({ where: { id: priceId } });
}

interface createProductReviewProps {
  userId: string | undefined;
  productId: string;
  score: number;
  title: string;
  text: string;
}

export async function createProductReview({
  userId,
  productId,
  score,
  title,
  text
}: createProductReviewProps) {
  return prisma.productReview.create({
    data: {
      product: { connect: { id: productId } },
      score: score,
      title: title,
      text: text,
      ...(userId && { user: { connect: { id: userId } } })
    }
  });
}
