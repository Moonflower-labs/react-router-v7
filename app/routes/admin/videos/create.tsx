import { Form, Link } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/create";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { createVideo } from "~/models/video.server";
import { MultiSelectId } from "~/components/shared/multi-select";
import { Category } from "@prisma/client";

export async function loader() {
  const categories = await prisma.category.findMany();
  return categories;
}


export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description");
  const url = formData.get("url");
  const section = formData.get("section");
  const categories = formData.getAll("categories") as string[];
  const published = formData.get("published") === "true";

  let errors: any = {};
  if (!title) {
    errors.title = "Escribe un título";
  }
  if (!description || typeof description !== "string") {
    errors.description = "Escribe una descripción";
  }
  if (!section || typeof section !== "string") {
    errors.section = "Elige la sección";
  }
  if (!url || typeof url !== "string") {
    errors.url = "El id del video es necesario";
  }
  if (!categories.length) {
    errors.categories = "Añade al menos una categoría";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Create the video blog
    await createVideo(String(section), title, String(description), String(url).trim(), categories, published);

    return { success: true, published };
  } catch (error) {
    console.log(error);
    return { success: false, published };
  }
}

export default function CreateVideoBlog({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Category[]>([]);

  const errors = actionData?.errors;

  useEffect(() => {
    if (actionData?.success && formRef?.current) {
      toast.success(`Video ${actionData?.published ? "pubicado" : "editado"} 👏🏽`);
      formRef.current.reset();
    }
  }, [actionData]);

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">
        Crea un Video de <span className="font-bold">Alma o Espíritu</span>
      </h2>
      <Form ref={formRef} method="post" className="w-full md:w-4/5 mx-auto pb-4 flex flex-col">
        <div className="flex flex-col md:flex-row gap-1 items-center justify-between mb-4">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sección</span>
            </div>
            <select className="select select-bordered select-primary mb-4" name="section" defaultValue={"Elige una sección"}>
              <option disabled>Elige una sección</option>
              <option value="Soul">Alma</option>
              <option value="Spirit">Espíritu</option>
            </select>
            {errors?.section && <ActionError actionData={{ error: errors?.section }} />}
          </label>
          <div className="w-full md:w-1/2">
            <div className="label">
              <span className="label-text">Categorías</span>
            </div>
            {loaderData?.length ? (
              <MultiSelectId name={"categories"} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={loaderData} />
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
        </div>

        <input type="text" name={"title"} className="input input-bordered input-primary w-full mb-4" placeholder="Título" />
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <input type="text" name={"url"} className="input input-bordered input-primary w-full mb-4" placeholder="Vídeo ID" />
        {errors?.url && <ActionError actionData={{ error: errors?.url }} />}
        <textarea className="w-full textarea textarea-primary mb-4" placeholder="Descripción del video..." name="description" rows={5}></textarea>
        {errors?.description && <ActionError actionData={{ error: errors.description }} />}

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
