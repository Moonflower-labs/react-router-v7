import { Await, href, Link, useFetcher } from "react-router";
import { TbTrash } from "react-icons/tb";
import type { Route } from "./+types/favorites";
import { getPaginatedFavoritePosts, getPaginatedFavoriteVideos, type PaginatedFavoritePosts, type PaginatedFavoriteVideos } from "~/models/profile.server";
import { CustomAlert } from "~/components/shared/info";
import { getUserId } from "~/middleware/sessionMiddleware";
import { Suspense } from "react";
import { Paginator } from "~/components/members/Pagination";

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = getUserId(context);
  const url = new URL(request.url);
  const postPage = url.searchParams.get("postPage") || 1;
  const videoPage = url.searchParams.get("videoPage") || 1;
  // Return the promises
  const favoritePostsPs = getPaginatedFavoritePosts(userId, Number(postPage), 5);
  const favoriteVideosPs = getPaginatedFavoriteVideos(userId, Number(videoPage), 5);
  return { favoritePostsPs, favoriteVideosPs };

}


export default function FavoritesPage({ loaderData }: Route.ComponentProps) {
  const { favoriteVideosPs, favoritePostsPs } = loaderData || {};
  const fetcher = useFetcher();

  return (
    <div className="px-3 overflow-x-hidden">
      <h2 className="font-bold text-2xl text-primary text-center py-4">Favoritos</h2>
      <CustomAlert>
        <p>Pincha en cada favorito para navegar al post o vídeo</p>
        <p className="flex gap-1.5 items-center">o en  <TbTrash className="text-error" /> para eliminarlo de tus favoritos.</p>
      </CustomAlert>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<FavoriteSkeleton />}  >
          <Await resolve={favoritePostsPs} errorElement={<CustomAlert level="error">Ha ocurrido un error</CustomAlert>}>
            {(resolvedData) => {
              const { favoritePosts, pagination } = resolvedData as PaginatedFavoritePosts
              return (
                <section className="py-6 text-center">
                  <h2 className="font-semibold text-xl text-primary">Posts</h2>
                  {favoritePosts?.length ? (
                    favoritePosts.map(fav => (
                      <div key={fav.id} className="flex flex-row text-start justify-between border border-primary/55 rounded-md my-2 p-2 shadow-md">
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
                  ) : (<div>No tienes ningún favorito</div>)}
                  <Paginator pagination={pagination} paramName="postPage" />
                </section>
              )
            }}
          </Await>
        </Suspense>

        <Suspense fallback={<FavoriteSkeleton />} >
          <Await resolve={favoriteVideosPs} errorElement={<CustomAlert level="error">Ha ocurrido un error</CustomAlert>}>
            {(resolvedData) => {
              const { favoriteVideos, pagination } = resolvedData as PaginatedFavoriteVideos;
              return (
                <section className="py-6 text-center">
                  <h2 className="font-semibold text-xl text-primary">Videos</h2>
                  {favoriteVideos?.length ? (
                    favoriteVideos.map(fav => (
                      <div key={fav?.video?.id} className="flex flex-row text-start justify-between border border-primary/55 rounded-md my-2 p-2 shadow-md">
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
                  <Paginator pagination={pagination} paramName="videoPage" />
                </section>
              )
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function FavoriteSkeleton() {

  return (
    <section className="py-6">
      <div className="skeleton h-6 w-24 mb-3 mx-auto"></div>
      {Array.from({ length: 4 }, (_, i) => i + 1).map((item, index) => (
        <div key={`favorites-item-${item + index}`} className="rounded border shadow p-2 mb-3">
          <div className="flex flex-rows gap-2 justify-between">
            <div className="skeleton h-4 w-2/3"></div>
            <div className="skeleton h-5 w-5"></div>
          </div>
        </div>
      ))}
      <div className="skeleton h-8 w-28 mx-auto"></div>
    </section>
  )
}