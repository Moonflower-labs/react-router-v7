import { Form, href, Link, redirect } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { useRef } from "react";
import { editPost, fetchPost } from "~/models/post.server";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { MultiSelectId } from "~/components/shared/multi-select";
import { getSessionContext } from "~/middleware/sessionMiddleware";


export async function loader({ params }: Route.LoaderArgs) {
  const [post, categories] = await Promise.all([
    fetchPost(params.id), prisma.category.findMany()
  ]);

  return { post, categories };
}

interface Errors {
  title?: string;
  description?: string;
  categories?: string; // You can adjust this based on how you want to manage categories
}
export async function action({ request, params, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = getSessionContext(context)
  const userId = session.get("userId");
  const title = formData.get("title") as string;
  const description = formData.get("description");
  const categories = formData.getAll("categories") as string[];
  const published = formData.get("published") === "true";

  let errors: Errors = {};
  if (!title) {
    errors.title = "Escribe un título";
  }
  if (!description || typeof description !== "string") {
    errors.description = "Escribe una descripción";
  }
  if (!categories.length) {
    errors.categories = "Añade al menos una categoría";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await editPost(params.id, userId, title, String(description), categories, published);
    session.flash("toastMessage", { type: "success", message: "Post editado 👏🏽" })

    return redirect(href("/admin/posts"))

  } catch (error) {
    console.error(error)
    session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })
  }
  return { success: false };
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const post = loaderData?.post;
  const categories = loaderData?.categories;

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">
        Editar Post de <span className="font-bold">Personalidad</span>{" "}
      </h2>
      <Form ref={formRef} method="post" className="card max-w-xs items-center mx-auto pb-4 flex flex-col">
        <label className="input input-lg mb-3 w-full">
          <span className="label">Título</span>
          <input type="text" name={"title"} placeholder="..." defaultValue={post?.title} />
        </label>
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <label className="textarea textarea-lg mb-4">
          <span className="label">Descripción</span>
          <textarea
            placeholder="Escribe el post..."
            name="description"
            rows={5}
            defaultValue={post?.description}
          >
          </textarea>
          {errors?.description && <ActionError actionData={{ error: errors.description }} />}
        </label>
        <div className="w-full">
          {categories?.length ? (
            <>
              <span className="label mb-2">Categorías</span>
              <MultiSelectId name={"categories"} defaultOptions={post?.categories} options={categories} />
            </>
          ) : (
            <div className="flex justify-center items-center gap-4">
              <div>No hay ninguna categoria todavía</div>
              <Link to={"/admin/categories/create"} className="text-primary btn btn-ghost btn-sm">
                <IoMdAdd size={24} />
              </Link>
            </div>
          )}
          {errors?.categories && <ActionError actionData={{ error: errors?.categories }} />}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button type="reset" className="btn btn-primary btn-outline btn-sm">
            Cancelar
          </button>
          <button type="submit" className="btn btn-accent btn-sm">
            Borrador
          </button>
          <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
            Publicar
          </button>
        </div>
      </Form>
    </div>
  );
}
