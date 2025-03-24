import { prisma } from "~/db.server";

import type { Product as Prod, Price, ProductReview } from "@prisma/client";

export interface Product extends Prod {
  prices: Price[];
  reviews?: ProductReview[];
}

export async function getAllProducts() {
  return prisma.product.findMany({
    where: { active: true },
    include: { prices: { where: { active: true } }, reviews: true }
  });
}

export async function getProduct(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      prices: true,
      reviews: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function createProduct(product: Omit<Product, "id" | "prices" | "reviews" | "createdAt" | "updatedAt">) {
  return prisma.product.create({ data: product });
}

export async function updateProduct(
  productId: string,
  product: Omit<Product, "id" | "prices" | "reviews" | "createdAt" | "updatedAt">
) {
  return prisma.product.update({ where: { id: productId }, data: product });
}

export async function deleteProduct(productId: string) {
  return prisma.product.delete({ where: { id: productId } });
}

export async function createPrice(price: Omit<Price, "id" | "createdAt" | "updatedAt">) {
  return prisma.price.create({ data: price });
}

export async function updatePrice(id: string, price: Omit<Price, "id" | "createdAt" | "updatedAt">) {
  return prisma.price.update({ where: { id }, data: price });
}

export async function deletePrice(priceId: string) {
  return prisma.price.delete({ where: { id: priceId } });
}

export async function getProductReviews(productId: string, page: number = 1, pageSize: number = 3) {
  const [reviews, totalReviews] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.productReview.count({ where: { productId } })
  ]);

  return { reviews, totalReviews };
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

export async function createProductReview({ userId, productId, score, title, text }: createProductReviewProps) {
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
