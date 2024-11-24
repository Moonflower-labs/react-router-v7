import { prisma } from "~/db.server";

export async function fetchPostComments(postId: string, page: number, pageSize: number) {
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      likes: { include: { user: { select: { id: true } } } },
      replies: {
        include: {
          likes: {
            include: {
              user: {
                select: { id: true, profile: { select: { avatar: true } } }
              }
            }
          },
          user: { select: { id: true, profile: { select: { avatar: true } } } }
        },
        orderBy: { createdAt: "desc" }
      },
      user: { select: { id: true, profile: { select: { avatar: true } } } }
    },
    orderBy: { createdAt: "desc" },
    // Add pagination
    take: pageSize,
    skip: (Number(page) - 1) * pageSize
  });
  const totalCount = await prisma.comment.count({
    where: { postId }
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { comments, pagination: { totalCount, totalPages, page, pageSize } };
}

export async function addPostComment(userId: string, text: string, postId: string) {
  return prisma.comment.create({
    data: {
      user: { connect: { id: userId } },
      post: { connect: { id: postId } },
      content: text
    }
  });
}

export async function addCommentReply(userId: string, text: string, commentId: string) {
  return prisma.reply.create({
    data: {
      user: { connect: { id: userId } },
      comment: { connect: { id: commentId } },
      content: text
    }
  });
}

export async function addReplytoReply(userId: string, text: string, replyId: string) {
  return prisma.reply.create({
    data: {
      user: { connect: { id: userId } },
      parentReply: { connect: { id: replyId } },
      content: text
    }
  });
}

export async function DeleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}

export async function DeleteReply(id: string) {
  return prisma.reply.delete({ where: { id } });
}
