import { Form, Link, useNavigate } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { MultiSelectId } from "~/components/shared/multi-select";
import type { Category } from "@prisma/client";
import { fetchVideo, updateVideo } from "~/models/video.server";

export async function loader({ params }: Route.LoaderArgs) {
  const video = await fetchVideo(params.id);
  const categories = await prisma.category.findMany();
  return { video, categories };
}


export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const section = formData.get("section") as string;
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

  await updateVideo(section, params.id, title, String(description), url.trim(), categories, published);

  return { success: true, published };
}

export default function EditVideoBlog({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const video = loaderData?.video;
  const categories = loaderData?.categories;
  const [selectedOptions, setSelectedOptions] = useState<Category[]>(video?.categories || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success && formRef?.current) {
      toast.success(`Video ${actionData?.published ? "pubicado" : "editado"} 👏🏽`);
      navigate("/admin/videos");
    }
  }, [actionData]);

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">Editar Vídeo</h2>
      <Form ref={formRef} method="post" className="w-full md:w-2/3 mx-auto pb-4 flex flex-col">
        <label className="form-control w-full max-w-md">
          <div className="label">
            <span className="label-text">Sección</span>
          </div>
          <select className="select select-bordered select-primary mb-4" name="section" defaultValue={video?.section}>
            <option disabled>Elige una sección</option>
            <option value="Soul">Alma</option>
            <option value="Spirit">Espíritu</option>
          </select>
          {errors?.section && <ActionError actionData={{ error: errors?.section }} />}
        </label>
        <label htmlFor="title" className="mb-3">
          Título
        </label>
        <input id="title" type="text" name={"title"} className="input input-bordered w-full mb-4" placeholder="Título" defaultValue={video?.title} />
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <label htmlFor="url" className="mb-3">
          Vídeo ID
        </label>
        <input id="url" type="text" name={"url"} className="input input-bordered w-full mb-4" placeholder="Vídeo ID" defaultValue={video?.url} />

        {errors?.url && <ActionError actionData={{ error: errors.url }} />}
        <textarea
          className="w-full textarea textarea-bordered mb-4"
          placeholder="Escribe el post..."
          name="description"
          rows={5}
          defaultValue={video?.description}></textarea>
        {errors?.description && <ActionError actionData={{ error: errors.description }} />}
        <div>
          {categories?.length ? (
            <MultiSelectId name={"categories"} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={categories} />
          ) : (
            <div className="flex justify-center items-center gap-4">
              <div>No hay ninguna categoria todavía</div>
              <Link to={""} className="text-primary btn btn-ghost btn-sm">
                <IoMdAdd size={24} />
              </Link>
            </div>
          )}
          {errors?.categories && <ActionError actionData={{ error: errors?.categories }} />}
        </div>
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
