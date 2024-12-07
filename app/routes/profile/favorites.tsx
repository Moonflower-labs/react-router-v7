import { Link, useFetcher } from "react-router";
import { TbTrash } from "react-icons/tb";
import type { Route } from "./+types/favorites";
import { requireUserId } from "~/utils/session.server";
import { getUserFavorites } from "~/models/profile.server";
import InfoAlert from "~/components/shared/info";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  try {
    const favorites = await getUserFavorites(userId);
    return { favorites };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default function Favorites({ loaderData }: Route.ComponentProps) {
  const favorites = loaderData?.favorites;
  const fetcher = useFetcher();
  const favPosts = favorites?.filter(favorite => favorite.postId !== null);
  const favVids = favorites?.filter(favorite => favorite.videoId !== null);

  return (
    <div className="px-3 overflow-x-hidden">
      <h2 className="font-bold text-2xl text-primary text-center py-4">Favoritos</h2>
      <InfoAlert level="Tip">Pincha en cada favorito para navegar al post o vídeo.</InfoAlert>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="py-6">
          <h2 className="font-semibold text-xl text-primary">Posts</h2>
          {favPosts?.length ? (
            favPosts.map(fav => (
              <div key={fav.id} className="flex flex-row justify-between border border-primary/55 rounded-md my-2 p-2 shadow-md">
                <Link to={`/personality/post/${fav?.post?.id}`} className="w-2/3 hover:opacity-80">
                  {fav?.post?.title}
                </Link>
                <fetcher.Form method="post" action={`/personality/post/${fav?.post?.id}`} className="text-end w-1/3">
                  <input type="hidden" name="id" value={fav?.post?.id} />
                  <input type="hidden" name="action" value={"remove"} />
                  <input type="hidden" name="intent" value="favorite" />
                  <button type="submit" className="text-accent text-xl" name="id" value={fav?.post?.id}>
                    <TbTrash className="text-error" />
                  </button>
                </fetcher.Form>
              </div>
            ))
          ) : (
            <div>No tienes ningún favorito</div>
          )}
        </section>
        <section className="py-6">
          <h2 className="font-semibold text-xl text-primary">Videos</h2>
          {favVids?.length ? (
            favVids.map(fav => (
              <div key={fav?.video?.id} className="flex flex-row justify-between border border-primary/55 rounded-md my-2 p-2 shadow-md">
                <Link to={`/${fav?.video?.section}/video/${fav?.video?.id}`} className="w-2/3">
                  {fav?.video?.title}
                </Link>
                <div className="flex flex-row gap-2 justify-end w-1/3">
                  <span className={`text-end badge badge-primary ${fav?.video?.section === "Soul" && "badge-outline"}`}>
                    {fav?.video?.section === "Soul" ? "Alma" : "Espíritu"}
                  </span>
                  <fetcher.Form method="post" action={`/${fav?.video?.section}/video/${fav?.video?.id}`} className="text-end">
                    <input type="hidden" name="id" value={fav?.video?.id} />
                    <input type="hidden" name="action" value={"remove"} />
                    <input type="hidden" name="intent" value="favorite" />
                    <button type="submit" className="text-xl" name="id" value={fav?.video?.id}>
                      <TbTrash className="text-error" />
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            ))
          ) : (
            <div>No tienes ningún favorito</div>
          )}
        </section>
        <section className="py-6">
          <h2 className="font-semibold text-2xl text-primary">Liked</h2>
          {/* {favorite_videos?.length ?   (
            favorite_videos?.map((video)=> (
            <div key={video.id}  className="flex flex-col sm:flex-row justify-between">
              <Link 
                to={`/${video.section}/video/${video.id}`}
                className="link link-accent"
              >
                {video.title}
              </Link>
              <div className="flex flex-row">
                <div className="flex flex-row gap-3">
                  {video?.section === "soul" ? <span>Alma</span> : <span>Espíritu</span>}
                  <fetcher.Form method="post" action={`/${video.section}/video/${video.id}`} className="text-end">
                    <input type="hidden" name="id" value={video.id} />
                    <input type="hidden" name="action" value={"remove"} />
                    <input type="hidden" name="intent" value="favorite" />
                    <button type="submit" className="text-accent text-xl" name="id" value={video.id}>
                      <TbTrash className="text-error" />
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            </div>
            ))
          ): (
            <div>No tienes ningún favorito</div>
          )} */}
          <div>TODO</div>
        </section>
      </div>
    </div>
  );
}
