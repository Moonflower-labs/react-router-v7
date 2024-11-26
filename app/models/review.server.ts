import type { Review as ReviewItem, User } from "@prisma/client";
import { prisma } from "~/db.server";

export interface Review extends ReviewItem {
  user: User;
}

export async function getReviews() {
  return prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
}

export async function createReview({
  userId,
  text,
  score = 1
}: {
  userId: string;
  text: string;
  score: number;
}) {
  return prisma.review.create({
    data: {
      user: { connect: { id: userId } },
      text,
      score
    }
  });
}
