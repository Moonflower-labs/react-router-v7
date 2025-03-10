import { data, Form, Link, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { deletePost, fetchPosts } from "~/models/post.server";
import { formatDate } from "~/utils/format";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Paginator } from "~/components/members/Pagination";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  let pickedCategories = url.searchParams.getAll("categories") || [];

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 3);
  const { posts, pagination } = await fetchPosts({ title, categories: pickedCategories, page, pageSize });

  return { posts, pagination, q: title };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const postId = formData.get("postId");

  if (!postId) {
    throw data({ message: "No post ID provided" }, { status: 400 });
  }
  //  Delete the post
  await deletePost(String(postId));

  return { success: true };
}

export default function ListPosts({ loaderData, actionData }: Route.ComponentProps) {
  const posts = loaderData?.posts;
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Post eliminado");
    }
  }, [actionData]);

  const handleSbubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const postId = form.postId.value;

    toast.warn(
      <div>
        <span>Quieres borrar este post?</span>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              console.log("Submitting form:", event.target);
              submit({ postId }, { method: "POST" });
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
      <h2 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">
        Posts de <span className="font-bold">Personalidad</span> <span className="badge badge-primary badge-outline">{loaderData?.pagination?.totalCount}</span>{" "}
      </h2>
      {posts?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <div key={post.id} className="card bg-base-100 card-md shadow-sm">
              <div className="card-body">
                <h2 className="card-title">{index + 1}. {post.title}</h2>
                <p>{formatDate(post.createdAt)}</p>
                <div className="justify-end card-actions items-center">
                  {post?.published ? <div className="badge badge-primary">Publicado</div> : <div className="badge badge-secondary">Borrador</div>}
                  <Link to={"create"} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <IoMdAdd size={24} className="text-success" />
                  </Link>
                  <Link to={`${post.id}/edit`} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <CiEdit size={24} className="text-info" />
                  </Link>
                  <Form method="post" onSubmit={handleSbubmit}>
                    <button type="submit" name="postId" value={post.id} className="btn btn-sm btn-circle btn-ghost shadow">
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
          <span>No hay ningún post, ponte a escribir ✍🏽 </span>
          <Link to={"create"} className="shadow-sm btn btn-outline btn-primary btn-sm">
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
