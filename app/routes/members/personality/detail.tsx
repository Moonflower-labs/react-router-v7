import { PiFlowerLotus } from "react-icons/pi";
import type { Route } from "./+types/detail";
import { addToFavoritePost, getPostWithAverageRating, type Post, ratePost } from "~/models/post.server";
import { formatDate } from "~/utils/format";
import { data, useRouteLoaderData } from "react-router";
import Comments from "~/components/members/Comments";
import { getUserId } from "~/utils/session.server";
import type { User } from "~/models/user.server";
import { LikeButton } from "~/components/members/LikeButton";
import { Favorite } from "~/components/members/Favorite";
import RatingForm from "~/components/members/Rating";
import { handleLike } from "~/models/like.server";
import { DeleteComment, DeleteReply, fetchPostComments } from "~/models/comment.server";

export function meta({ data }: Route.MetaArgs) {
  const { post } = data;
  const postUrl = `${process.env.RENDER_URL || 'http://localhost:5173'}/members/personality/post/${post.id}`;

  return [
    { title: post.title },
    { name: "description", content: "Check out this awesome post!" },
    { property: "og:title", content: post.title },
    { property: "og:description", content: "Check out this awesome post!" },
    { property: "og:image", content: "https://laflorblanca-ysjl.onrender.com/flower.png" }, // Use actual post image if available
    { property: "og:url", content: postUrl },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: "Check out this awesome post!" },
    { name: "twitter:image", content: "https://laflorblanca-ysjl.onrender.com/flower.png" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  if (!params.id) {
    throw data({ message: "No post ID provided!" }, { status: 400 });
  }
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = 10;
  const [post, { comments, pagination }] = await Promise.all([
    getPostWithAverageRating(params.id),
    fetchPostComments(params.id, page, pageSize)
  ]);
  if (!post) {
    throw data({ message: "No hemos encontrado el post 🙁" }, { status: 404 });
  }
  return { post, comments, page, pagination };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (!params.id) {
    throw new Error("No post ID provided!");
  }
  if (!userId || userId.startsWith("guest-")) {
    throw data({ message: "User ID missing!" }, { status: 400 });
  }
  if (request.method === "DELETE") {
    const id = formData.get("id");
    const isReply = formData.get("object") === "reply";
    if (typeof id !== "string") {
      throw data({ message: "No id to found" }, { status: 400 });
    }
    if (isReply) {
      return DeleteReply(id);
    }
    return DeleteComment(id);
  }
  switch (intent) {
    case "rating": {
      const value = Number(formData.get("rating-value")) || 5;
      if (userId) {
        return ratePost(userId, value, params.id);
      }
      break;
    }
    case "comment": {
      // CURRENTLY HANDLED BY api/comments
      break;
    }
    case "like": {
      const postId = formData.get("post");
      const commentId = formData.get("comment");
      const replyId = formData.get("reply");
      const action = formData.get("action"); // like or  unlike

      if (postId) {
        return handleLike(String(action), "post", userId, String(postId));
      }
      if (commentId) {
        return handleLike(String(action), "comment", userId, String(commentId));
      }
      if (replyId) {
        return handleLike(String(action), "reply", userId, String(replyId));
      }
    }
    case "favorite": {
      return addToFavoritePost(userId, params.id);
    }
    default: {
      throw data(null, { status: 405 });
    }
  }
}

export default function PersonalityDetail({ loaderData }: Route.ComponentProps) {
  const user = (useRouteLoaderData("root")?.user as User) || null;
  const post = loaderData?.post as Post;
  const hasRated = post?.rating.some((rating: any) => rating?.user?.id === user?.id) || false;
  const isLiked = post?.likes.some((like: any) => like?.user.id === user?.id);
  const isFavorite = post?.favorites.some((item: any) => item?.user.id === user?.id);

  return (
    <>
      <article className="pb-6 pt-16 px-10 md:px-40">
        <h2 className="text-primary font-semibold text-2xl text-center mt-4 mb-3">{post?.title}</h2>
        <div className="mb-4 flex gap-2">
          {post?.categories?.length &&
            post.categories.map(category => (
              <div key={category.id} className="badge badge-outline badge-info badge-sm">
                {category.name}
              </div>
            ))}
        </div>
        <p className="whitespace-pre-wrap mb-8">{post?.description}</p>
        <p className="mb-4">La Flor Blanca el {formatDate(post?.createdAt)}</p>

        <div className="divider divider-primary md:w-2/3 mx-auto">
          <span className="text-primary">
            <PiFlowerLotus size={34} />
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
          <div className="flex flex-row gap-4 justify-between items-center md:w-1/5">
            <Favorite object={post} isFavorite={isFavorite} />
            <LikeButton object="post" id={post?.id} isLiked={isLiked} />
            <div className="">
              <div className="stat-desc">Puntuación</div>
              <div className="stat-value">{post?.averageRating?.toFixed(1) || "--"}</div>
              <div className="stat-desc">Votaciones {post?.rating?.length}</div>
            </div>
          </div>
          <RatingForm hasRated={hasRated} />
        </div>
      </article>
      <Comments objectId={post?.id} fieldName="post" />
    </>
  );
}
