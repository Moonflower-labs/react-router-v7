import type { Route } from "./+types/comments";
import { getUserId } from "~/utils/session.server";
import { addVideoComment } from "~/models/video.server";
import { data } from "react-router";
import { addCommentReply, addPostComment, addReplytoReply } from "~/models/comment.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text") as string;
  const action = formData.get("action");
  if (text.trim() === "") {
    return { error: "Escribe algo" };
  }
  const userId = await getUserId(request);
  if (!userId) {
    throw data({ message: "User ID is required" }, { status: 400 });
  }

  switch (action) {
    case "comment": {
      // handle post comment
      const postId = formData.get("post");
      if (postId) {
        const comment = await addPostComment(userId, text, String(postId));
      }
      // handle video comment
      const videoId = formData.get("video");
      if (videoId) {
        const video = await addVideoComment(userId, text, String(videoId));
      }
      break;
    }
    case "reply": {
      // handle a reply to a reply
      const replyId = formData.get("reply");
      if (replyId) {
        await addReplytoReply(userId, text, String(replyId));
      }
      // handle a reply to a comment
      const commentId = formData.get("comment");
      if (commentId) {
        await addCommentReply(userId, text, String(commentId));
      }
      break;
    }
    default: {
      throw data({ message: "Action is required" }, { status: 400 });
    }
  }
  return { success: true };
}
