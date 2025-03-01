import { prisma, type Prisma } from "~/db.server";

import type {
  Video as PrismaVideo,
  Like,
  Category,
  Favorite,
  Section
} from "@prisma/client";

export type Video = Prisma.VideoGetPayload<{
  include: { comments: true; likes: true };
}>;

export async function fetchVideos({
  section,
  title,
  categories,
  page = 1,
  pageSize = 5
}: {
  section: Section | undefined;
  title: string | null;
  categories: string[];
  page: number;
  pageSize: number;
}) {
  const where: Prisma.VideoWhereInput = {
    section
  };
  // Add filters
  if (title) {
    where.title = {
      contains: title, // Checks if title is contained in the video's title
      mode: "insensitive"
    };
  }

  // if (category) {
  //   where.categories = { some: { name: category } };
  // }
  if (categories && categories.length > 0) {
    where.categories = {
      some: {
        name: { in: categories } // Using 'in' to match any of the provided categories
      }
    };
  }
  // Add pagination
  const take = pageSize; // The number of items to return
  const skip = (Number(page) - 1) * pageSize; // Number of items to skip for pagination

  const videos = (await prisma.video.findMany({
    where,
    take, // Limit results
    skip,
    include: { likes: true, comments: true },
    orderBy: { createdAt: "desc" }
  })) as Prisma.VideoGetPayload<{
    include: { likes: true; comments: true };
  }>[];
  const totalCount = await prisma.video.count({
    where
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { videos, pagination: { totalCount, totalPages, page, pageSize } };
}

export async function fetchVideo(videoId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      favorites: { include: { user: true } },
      likes: { include: { user: true } },
      categories: true
    }
  });
  return video as Prisma.VideoGetPayload<{
    include: { likes: true; favorites: true; categories: true };
  }>;
}
export async function fetchVideoComments(
  videoId: string,
  page: number,
  pageSize: number
) {
  const comments = await prisma.comment.findMany({
    where: { videoId },
    include: {
      likes: { include: { user: { select: { id: true, username: true } } } },
      replies: {
        include: {
          likes: {
            include: {
              user: {
                select: {
                  id: true,
                  profile: { select: { avatar: true } }
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              profile: { select: { avatar: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      user: {
        select: {
          id: true,
          username: true,
          profile: { select: { avatar: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    // Add pagination
    take: pageSize,
    skip: (Number(page) - 1) * pageSize
  });
  const totalCount = await prisma.comment.count({
    where: { videoId }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { comments, pagination: { totalCount, totalPages, page, pageSize } };
}

export async function addVideoComment(
  userId: string,
  content: string,
  videoId: string
) {
  return prisma.comment.create({
    data: {
      user: { connect: { id: userId } },
      video: { connect: { id: videoId } },
      content
    }
  });
}

export async function addToFavoriteVideo(userId: string, videoId: string) {
  const favorite = await prisma.favorite.findFirst({
    where: { videoId, userId }
  });

  if (favorite) {
    return prisma.favorite.delete({
      where: { id: favorite.id }
    });
  }

  return prisma.favorite.create({
    data: {
      user: { connect: { id: userId } },
      video: { connect: { id: videoId } }
    }
  });
}

export async function createVideo(
  section: Section,
  title: string,
  description: string,
  url: string,
  categoryIds?: string[],
  published?: boolean
) {
  let categoriesToConnect = undefined;

  if (categoryIds && categoryIds.length > 0) {
    categoriesToConnect = categoryIds.map(id => ({ id }));
  }
  return prisma.video.create({
    data: {
      title,
      description,
      section,
      url,
      categories: categoriesToConnect
        ? { connect: categoriesToConnect }
        : undefined,
      published
    }
  });
}

export async function updateVideo(
  section: Section | undefined,
  videoId: string,
  title: string,
  description: string,
  url: string,
  categoryIds?: string[],
  published?: boolean
) {
  let categoriesToConnect = undefined;

  if (categoryIds && categoryIds.length > 0) {
    categoriesToConnect = categoryIds.map(id => ({ id }));
  }

  return prisma.video.update({
    where: { id: videoId },
    data: {
      title,
      description,
      url,
      categories: { set: categoriesToConnect ?? [] },
      published,
      section
    }
  });
}

export async function deleteVideo(videoId: string) {
  return prisma.video.delete({ where: { id: videoId } });
}
