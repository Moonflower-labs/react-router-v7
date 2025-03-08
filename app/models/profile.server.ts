import { prisma } from "~/db.server";
import type { Favorite as PrismaFav, Post, Video } from "@prisma/client";

export interface Favorite extends PrismaFav {
  post?: Post | null | undefined;
  video?: Video | null | undefined;
}

export type UserWithProfile = Awaited<ReturnType<typeof getUserProfile>>;

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      favorites: true,
      subscription: { include: { plan: true } }
    }
  });
}

export async function getUserFavorites(userId: string): Promise<Favorite[]> {
  const favorites = await prisma.favorite.findMany({
    where: { userId: userId },
    include: { post: true, video: true }
  });
  return favorites;
}

export async function updateUserAvatar(userId: string, avatar: string) {
  return prisma.profile.update({
    where: { userId: userId },
    data: { avatar: avatar }
  });
}
