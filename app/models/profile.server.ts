import { prisma } from "~/db.server";
import type { Favorite as PrismaFav, Post, Video } from "@prisma/client";
import type { Pagination } from "./post.server";

type FavoritePost = PrismaFav & {
  post?: Partial<Post> | null | undefined;
};

type FavoriteVideo = PrismaFav & {
  video?: Partial<Video> | null | undefined;
};

export type UserWithProfile = Awaited<ReturnType<typeof getUserProfile>>;

export interface PaginatedFavoritePosts {
  favoritePosts: FavoritePost[];
  pagination: Pagination;
}

export interface PaginatedFavoriteVideos {
  favoriteVideos: FavoriteVideo[];
  pagination: Pagination;
}

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

/**
 * @param userId id of the user
 * @param page the requested page, defaults to 1
 * @param pageSize the number of items per page, defaults to 5
 * @returns an object { favoritePosts, pagination: { totalCount, totalPages, page, pageSize }}
 */
export async function getPaginatedFavoritePosts(
  userId: string,
  page: number = 1,
  pageSize: number = 5
): Promise<PaginatedFavoritePosts> {
  const favoritePosts = await prisma.favorite.findMany({
    where: { userId, post: { isNot: null } },
    include: { post: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const totalCount = await prisma.favorite.count({
    where: { userId, post: { isNot: null } }
  });
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    favoritePosts,
    pagination: { totalCount, totalPages, page, pageSize }
  };
}

/**
 * @param userId id of the user
 * @param page the requested page, defaults to 1
 * @param pageSize the number of items per page, defaults to 5
 * @returns an object { favoriteVideos, pagination: { totalCount, totalPages, page, pageSize }}
 */
export async function getPaginatedFavoriteVideos(
  userId: string,
  page: number = 1,
  pageSize: number = 6
): Promise<PaginatedFavoriteVideos> {
  const favoriteVideos = await prisma.favorite.findMany({
    where: { userId, video: { isNot: null } },
    include: { video: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const totalCount = await prisma.favorite.count({
    where: { userId, post: { isNot: null } }
  });
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    favoriteVideos,
    pagination: { totalCount, totalPages, page, pageSize }
  };
}

export async function updateUserAvatar(userId: string, avatar: string) {
  return prisma.profile.update({
    where: { userId: userId },
    data: { avatar: avatar }
  });
}
