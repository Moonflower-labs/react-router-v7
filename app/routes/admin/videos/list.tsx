import { data, Form, href, Link, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { formatDate } from "~/utils/format";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { deleteVideo, fetchVideos } from "~/models/video.server";
import { Paginator } from "~/components/members/Pagination";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  let categories = url.searchParams.getAll("categories");

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 2);
  const { videos, pagination } = await fetchVideos({ section: undefined, title, categories, page, pageSize });

  return { videos, pagination, q: title };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const videoId = formData.get("videoId");

  if (!videoId) {
    throw data({ message: "No post ID provided" }, { status: 400 });
  }
  //  Delete the post
  await deleteVideo(String(videoId));

  return { success: true };
}

export default function ListPosts({ loaderData, actionData }: Route.ComponentProps) {
  const videos = loaderData?.videos;
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Video eliminado");
    }
  }, [actionData]);

  const handleSbubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const videoId = form.videoId.value;

    toast.warn(
      <div>
        <span>Quieres borrar este video?</span>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              console.log("Submitting form:", event.target);
              submit({ videoId }, { method: "POST" });
            }}
            className="btn btn-sm btn-primary">
            Yes
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-sm btn-primary">
            No
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        draggable: false
      }
    );
  };

  return (
    <div>
      <h2 className="text-2xl text-primary text-center my-5">
        Videos de <span className="font-bold">Alma y Espíritu</span>
      </h2>
      {videos?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <div key={video.id} className="card bg-base-100 card-md shadow-sm">
              <div className="card-body">
                <h2 className="card-title">{video.title}</h2>
                <span className="badge badge-primary">{video.section}</span>
                <p>{formatDate(video.createdAt)}</p>
                <div className="justify-end card-actions items-center">
                  {video?.published ? <div className="badge badge-primary">Publicado</div> : <div className="badge badge-secondary">Borrador</div>}
                  <Link to={"create"} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <IoMdAdd size={24} className="text-success" />
                  </Link>
                  <Link to={`${video.id}/edit`} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <CiEdit size={24} className="text-info" />
                  </Link>
                  <Form method="post" onSubmit={handleSbubmit}>
                    <button type="submit" name="postId" value={video.id} className="btn btn-sm btn-circle btn-ghost shadow">
                      <ImBin size={20} className="text-error" />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 justify-center items-center">
          <span>No hay ningún video todavía, ponte a grabar 🎥</span>
          <Link to={href("/admin/videos/create")} className="shadow-sm btn btn-outline btn-primary btn-sm">
            <IoMdAdd size={24} />
          </Link>
        </div>
      )}
      <div className="text-center">
        <Paginator pagination={loaderData?.pagination} />
      </div>
    </div>
  );
}
