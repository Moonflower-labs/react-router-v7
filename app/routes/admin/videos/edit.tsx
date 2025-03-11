import { Form, href, Link, redirect } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { useRef } from "react";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { MultiSelectId } from "~/components/shared/multi-select";
import type { Section } from "@prisma/client";
import { fetchVideo, updateVideo } from "~/models/video.server";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ params }: Route.LoaderArgs) {
  const video = await fetchVideo(params.id);
  const categories = await prisma.category.findMany();
  return { video, categories };
}


export async function action({ request, params, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = getSessionContext(context)
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const section = formData.get("section");
  const description = formData.get("description");
  const categories = formData.getAll("categories") as string[];
  const published = formData.get("published") === "true";

  let errors: any = {};
  if (published) {
    if (!url) errors.url = "Debes de dar una URL si quieres publicar el vídeo";
  }
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
    await updateVideo(section as Section, params.id, title, String(description), url.trim(), categories, published);
    session.flash("toastMessage", { type: "success", message: "Vídeo editado 👏🏽" })

    return redirect(href("/admin/videos"))

  } catch (error) {
    console.error(error)
    session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })
  }
  return { success: false };
}

export default function EditVideoBlog({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const { video, categories } = loaderData;

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">Editar Vídeo</h2>
      <Form ref={formRef} method="post" className="w-full md:w-3/5 lg:w-2/5 mx-auto pb-4 flex flex-col">
        <label className="select select-lg mb-3 w-full">
          <span className="label">Sección</span>
          <select name="section" defaultValue={video?.section}>
            <option disabled>Elige una sección</option>
            <option value="Soul">Alma</option>
            <option value="Spirit">Espíritu</option>
          </select>
          {errors?.section && <ActionError actionData={{ error: errors?.section }} />}
        </label>
        <label className="input input-lg mb-3 w-full">
          <span className="label">Título</span>
          <input type="text" name={"title"} placeholder="Título" defaultValue={video?.title} />
        </label>
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <label className="input input-lg mb-3 w-full">
          <span className="label">Vídeo ID</span>
          <input type="text" name={"url"} placeholder="Vídeo ID" defaultValue={video?.url} />
        </label>
        {errors?.url && <ActionError actionData={{ error: errors.url }} />}
        <label>
          <span className="label mb-2">Descripción</span>
          <textarea
            className="w-full textarea mb-4"
            placeholder="Escribe la descripción..."
            name="description"
            rows={5}
            defaultValue={video.description}
          >
          </textarea>
          {errors?.description && <ActionError actionData={{ error: errors.description }} />}
        </label>
        <>
          {categories?.length ? (
            <>
              <span className="label mb-2">Categorías</span>
              <MultiSelectId name={"categories"} defaultOptions={video.categories} options={categories} />
            </>
          ) : (
            <div className="flex justify-center items-center gap-4">
              <div>No hay ninguna categoria todavía</div>
              <Link to={href("/admin/categories/create")} className="text-primary btn btn-ghost btn-sm">
                <IoMdAdd size={24} />
              </Link>
            </div>
          )}
          {errors?.categories && <ActionError actionData={{ error: errors?.categories }} />}
        </>
        <div className="flex justify-end gap-3 mt-8">
          <button type="submit" className="btn btn-accent btn-sm">
            Borrador
          </button>
          <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
            Publicar cambios
          </button>
        </div>
      </Form>
    </div>
  );
}
