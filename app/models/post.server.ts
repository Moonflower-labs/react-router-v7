import { prisma, type Prisma } from "~/db.server";
import type { User } from "~/models/user.server";
import type {
  Post as PrismaPost,
  Comment as PrismaComment,
  Category,
  Like,
  Favorite,
  Rating,
  Reply as PrismaReply
} from "@prisma/client";

export interface Post extends PrismaPost {
  comments?: Comment[];
  categories?: Category[];
  likes: Like[];
  favorites: Favorite[];
  rating: Rating[];
  averageRating: number;
}
export interface Comment extends PrismaComment {
  user: User;
  likes: Like[];
  replies: Reply[];
}
export interface Reply extends PrismaReply {
  user: User;
  likes: Like[];
  replies: Reply[];
}

export interface Pagination {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export async function fetchPosts({
  title,
  categories,
  page = 1,
  pageSize = 10
}: {
  title?: string | null;
  categories?: string[];
  page: number;
  pageSize: number;
}) {
  const where: Prisma.PostWhereInput = {};
  // Add filters
  if (title) {
    where.title = {
      contains: title, // Checks if title is contained in the video's title
      mode: "insensitive"
    };
  }

  if (categories && categories.length > 0) {
    where.categories = {
      some: {
        name: { in: categories } // Using 'in' to match any of the provided categories
      }
    };
  }
  // Add pagination
  const take = pageSize; // Number of items to return
  const skip = (Number(page) - 1) * pageSize; // Number of items to skip for pagination

  const posts = await prisma.post.findMany({
    where,
    take, // Limit results
    skip,
    orderBy: { createdAt: "desc" }
  });
  const totalCount = await prisma.post.count({
    where
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { posts, pagination: { totalCount, totalPages, page, pageSize } };
}

export async function fetchPostsWithAverageRating({
  title,
  categories,
  page = 1,
  pageSize = 10
}: {
  title: string | null;
  categories: string[];
  page: number;
  pageSize: number;
}) {
  const where: Prisma.PostWhereInput = {
    published: true
  };

  // Add filters
  if (title) {
    where.title = {
      contains: title, // Checks if title is contained in the video's title
      mode: "insensitive"
    };
  }

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

  const posts = await prisma.post.findMany({
    where,
    include: { comments: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take, // Limit results
    skip
  });
  // Get the post IDs for batch rating aggregation
  const postIds = posts.map(post => post.id);

  // Fetch average ratings for all posts in a single query
  const ratings = await prisma.rating.groupBy({
    by: ["postId"],
    _avg: {
      value: true
    },
    where: {
      postId: {
        in: postIds // Only get ratings for the posts we fetched
      }
    }
  });

  // Create a mapping of average ratings by postId
  const ratingMap = ratings.reduce(
    (acc, rating) => {
      acc[rating.postId!] = rating._avg.value || 0;
      return acc;
    },
    {} as Record<string, number>
  );

  // Attach average ratings to posts
  const postWithRatings = posts.map(post => ({
    ...post,
    averageRating: ratingMap[post.id] || 0
  }));
  const totalCount = await prisma.post.count({
    where
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    posts: postWithRatings,
    pagination: { totalCount, totalPages, page, pageSize }
  };
}

export async function fetchPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      rating: true,
      likes: { include: { user: true } },
      favorites: true,
      categories: true
    }
  });
}

export async function getPostWithAverageRating(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      rating: { include: { user: { select: { id: true } } } },
      likes: { include: { user: { select: { id: true } } } },
      favorites: { include: { user: { select: { id: true } } } },
      categories: true
    }
  });

  const averageRating = await prisma.rating.aggregate({
    _avg: {
      value: true
    },
    where: {
      postId: postId // Filter ratings related to this post
    }
  });

  return {
    ...post,
    averageRating: averageRating._avg.value || 0 // Default to 0 if no ratings found
  };
}

export async function ratePost(userId: string, value: number, postId: string) {
  return prisma.rating.create({
    data: {
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
      value
    }
  });
}

export async function addToFavoritePost(userId: string, postId: string) {
  const favorite = await prisma.favorite.findFirst({
    where: { postId, userId }
  });

  if (favorite) {
    return prisma.favorite.delete({
      where: { id: favorite.id }
    });
  }

  return prisma.favorite.create({
    data: {
      user: { connect: { id: userId } },
      post: { connect: { id: postId } }
    }
  });
}

export async function createPost(
  userId: string,
  title: string,
  description: string,
  categoryIds?: string[],
  published?: boolean
) {
  let categoriesToConnect = undefined;

  if (categoryIds && categoryIds.length > 0) {
    categoriesToConnect = categoryIds.map(id => ({ id }));
  }
  return prisma.post.create({
    data: {
      title,
      description,
      user: { connect: { id: userId } },
      categories: categoriesToConnect ? { connect: categoriesToConnect } : undefined,
      published
    }
  });
}

export async function editPost(
  postId: string,
  userId: string,
  title: string,
  description: string,
  categoryIds?: string[],
  published?: boolean
) {
  let categoriesToConnect = undefined;

  if (categoryIds && categoryIds.length > 0) {
    categoriesToConnect = categoryIds.map(id => ({ id }));
  }

  return prisma.post.update({
    where: { id: postId },
    data: {
      title,
      description,
      user: { connect: { id: userId } },
      categories: { set: categoriesToConnect ?? [] },
      published
    }
  });
}

export async function deletePost(postId: string) {
  return prisma.post.delete({ where: { id: postId } });
}
