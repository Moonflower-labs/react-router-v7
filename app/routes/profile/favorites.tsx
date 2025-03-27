import { href, Link, useFetcher } from "react-router";
import { TbTrash } from "react-icons/tb";
import type { Route } from "./+types/favorites";
import { getUserFavorites } from "~/models/profile.server";
import { CustomAlert } from "~/components/shared/info";
import { getUserId } from "~/middleware/sessionMiddleware";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = getUserId(context);

  try {
    const favorites = await getUserFavorites(userId);
    return { favorites };
  } catch (error) {
    console.log(error);
    return {};
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
      <CustomAlert>
        <p>Pincha en cada favorito para navegar al post o vídeo</p>
        <p className="flex gap-1.5 items-center">o en  <TbTrash className="text-error" /> para eliminarlo de tus favoritos.</p>
      </CustomAlert>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="py-6">
          <h2 className="font-semibold text-xl text-primary">Posts</h2>
          {favPosts?.length ? (
            favPosts.map(fav => (
              <div key={fav.id} className="flex flex-row justify-between border border-primary/55 rounded-md my-2 p-2 shadow-md">
                <Link to={href("/members/personality/post/:id", { id: fav?.post?.id! })} className="w-2/3 hover:opacity-80">
                  {fav?.post?.title}
                </Link>
                <fetcher.Form method="post" action={href("/members/personality/post/:id", { id: fav?.post?.id as string })} className="text-end w-1/3">
                  <input type="hidden" name="id" value={fav?.post?.id} />
                  <input type="hidden" name="action" value={"remove"} />
                  <input type="hidden" name="intent" value="favorite" />
                  <button type="submit" className="text-accent text-xl cursor-pointer hover:bg-base-200 disabled:opacity-80 rounded-full p-1 shadow" disabled={fetcher.state === "submitting"} name="id" value={fav?.post?.id}>
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
                <Link to={`${href("/members")}/${fav?.video?.section}/video/${fav?.video?.id}`} className="w-2/3">
                  {fav?.video?.title}
                </Link>
                <div className="flex flex-row gap-2 justify-end w-1/3">
                  <span className={`text-end badge badge-primary ${fav?.video?.section === "Soul" && "badge-outline"}`}>
                    {fav?.video?.section === "Soul" ? "Alma" : "Espíritu"}
                  </span>
                  <fetcher.Form method="post" action={`${href("/members")}/${fav?.video?.section}/video/${fav?.video?.id}`} className="text-end">
                    <input type="hidden" name="id" value={fav?.video?.id} />
                    <input type="hidden" name="action" value={"remove"} />
                    <input type="hidden" name="intent" value="favorite" />
                    <button type="submit" className="text-xl cursor-pointer hover:bg-base-200 disabled:opacity-80 rounded-full p-1 shadow" disabled={fetcher.state === "submitting"} name="id" value={fav?.video?.id}>
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
          {/* <h2 className="font-semibold text-2xl text-primary">Liked</h2> */}
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
          {/* <div>TODO</div> */}
        </section>
      </div>
    </div>
  );
}
