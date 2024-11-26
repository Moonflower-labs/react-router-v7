import { useParams, Link, useRouteLoaderData, data } from "react-router";
import { PiFlowerLotus } from "react-icons/pi";
import type { Route } from "./+types/detail";
import { addToFavoriteVideo, fetchVideo, fetchVideoComments, Video } from "~/models/video.server";
import Comments from "~/components/members/Comments";
import VideoComponent from "~/components/members/VideoComponent";
import { formatDate } from "~/utils/format";
import { User } from "~/models/user.server";
import { Favorite } from "~/components/members/Favorite";
import { LikeButton } from "~/components/members/LikeButton";
import { DeleteReply, DeleteComment } from "~/models/comment.server";
import { handleLike } from "~/models/like.server";
import { getUserId } from "~/utils/session.server";
import type { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  if (!params.id) {
    throw data({ message: "No param ID provided!" }, { status: 400 });
  }
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = 10;

  const [video, { comments, pagination }] = await Promise.all([fetchVideo(params.id), fetchVideoComments(params.id, page, pageSize)]);
  return { video, comments, pagination };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = await getUserId(request);
  if (!params.id) {
    throw new Error("No post ID provided!");
  }
  if (!userId) {
    throw new Error("No user ID provided!");
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
    case "like":
      const videoId = formData.get("video");
      const commentId = formData.get("comment");
      const replyId = formData.get("reply");
      const action = formData.get("action"); // like or  unlike

      if (videoId) {
        return handleLike(String(action), "video", userId, String(videoId));
      }
      if (commentId) {
        return handleLike(String(action), "comment", userId, String(commentId));
      }
      if (replyId) {
        return handleLike(String(action), "reply", userId, String(replyId));
      }
      break;
    case "favorite":
      return addToFavoriteVideo(userId, params.id);
    default:
      throw new Response("", { status: 405 });
  }
}

export default function SpiritDetail({ loaderData }: Route.ComponentProps) {
  const user = useRouteLoaderData("root")?.user as User;
  const video = loaderData?.video;
  const isLiked = video?.likes.some((like: any) => like?.user.id === user?.id);
  const isFavorite = video?.favorites?.some((item: any) => item?.user.id === user?.id);

  return (
    <>
      <article className="pb-6 pt-16 px-10 md:px-40">
        <h2 className="relative text-secondary font-semibold text-2xl text-center mt-4 mb-3">{video?.title}</h2>
        <VideoComponent video={video as unknown as Video} />
        <div className="my-4 flex gap-2">
          {video?.categories?.length &&
            video.categories.map((category: { id: Key | null | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
              <div key={category.id} className="badge badge-outline badge-info badge-sm">
                {category.name}
              </div>
            ))}
        </div>
        <p className="mb-4">La Flor Blanca el {formatDate(video?.createdAt as Date)}</p>

        <div className="divider divider-primary md:w-2/3 mx-auto">
          <span className="text-primary">
            <PiFlowerLotus size={34} />
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 align-middle">
          <div className="flex gap-4 align-middle">
            <Favorite object={video as unknown as Video} isFavorite={!!isFavorite} />
          </div>
          <LikeButton object="video" id={String(video?.id)} isLiked={!!isLiked} />
        </div>
      </article>
      <Comments objectId={String(video?.id)} fieldName="video" />
    </>
  );
}

export function ErrorBoundary() {
  const params = useParams();

  return (
    <div className="text-3xl text-center h-full my-auto pt-24">
      <p className="mb-4"> No hemos encontrado el video 😩 con ID {params.id}.</p>
      <Link to={".."} className="btn btn-sm btn-primary">
        Volver
      </Link>
    </div>
  );
}
