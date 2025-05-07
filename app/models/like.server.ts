import { prisma } from "~/db.server";

export async function handleLike(
  action: string,
  object: "post" | "video" | "comment" | "reply",
  userId: string,
  id: string
) {
  switch (object) {
    case "post": {
      if (action === "like") {
        return prisma.like.create({
          data: {
            user: { connect: { id: userId } },
            post: { connect: { id } }
          }
        });
      }
      const like = await prisma.like.findFirst({
        where: {
          userId,
          postId: id
        }
      });
      if (!like) {
        throw new Error("Existing like not found");
      }
      return prisma.like.delete({
        where: {
          id: like.id
        }
      });
    }
    case "comment": {
      if (action === "like") {
        return prisma.like.create({
          data: {
            user: { connect: { id: userId } },
            comment: { connect: { id } }
          }
        });
      }
      const like = await prisma.like.findFirst({
        where: {
          userId,
          commentId: id
        }
      });
      if (!like) {
        throw new Error("Existing like not found");
      }
      return prisma.like.delete({
        where: {
          id: like.id
        }
      });
    }
    case "video": {
      if (action === "like") {
        return prisma.like.create({
          data: {
            user: { connect: { id: userId } },
            video: { connect: { id } }
          }
        });
      }
      const like = await prisma.like.findFirst({
        where: {
          userId,
          videoId: id
        }
      });

      if (!like) {
        throw new Error("Existing like not found");
      }
      return prisma.like.delete({
        where: {
          id: like.id
        }
      });
    }
    case "reply": {
      if (action === "like") {
        return prisma.like.create({
          data: {
            user: { connect: { id: userId } },
            reply: { connect: { id } }
          }
        });
      }
      const like = await prisma.like.findFirst({
        where: {
          userId,
          replyId: id
        }
      });

      if (!like) {
        throw new Error("Existing like not found");
      }
      return prisma.like.delete({
        where: {
          id: like.id
        }
      });
    }
    default: {
      throw new Error("Bad request: No post or comment detected in the intent");
    }
  }
}
