import { Form, href, Link } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/create";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { createVideo } from "~/models/video.server";
import { MultiSelectId } from "~/components/shared/multi-select";
import type { Category, Section } from "@prisma/client";

export async function loader() {
  const categories = await prisma.category.findMany();
  return { categories };
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
    await createVideo(String(section) as Section, title, String(description), String(url).trim(), categories, published);

    return { success: true, published };
  } catch (error) {
    console.log(error);
    return { success: false, published };
  }
}

export default function CreateVideoBlog({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Category[]>([]);
  const { categories } = loaderData
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
      <Form ref={formRef} method="post" className="w-full md:w-[65%] lg:w-1/3 mx-auto pb-4 flex flex-col">
        <fieldset className="fieldset w-full bg-base-200 border border-base-300 p-4 rounded-box">
          <label className="select select-lg mb-3 w-full">
            <span className="label">Sección</span>
            <select name="section" >
              <option disabled>Elige una sección</option>
              <option value="Soul">Alma</option>
              <option value="Spirit">Espíritu</option>
            </select>
            {errors?.section && <ActionError actionData={{ error: errors?.section }} />}
          </label>
          <label className="input input-lg mb-3 w-full">
            <span className="label">Título</span>
            <input type="text" name={"title"} placeholder="..." />
          </label>
          {errors?.title && <ActionError actionData={{ error: errors.title }} />}
          <label className="input input-lg mb-3 w-full">
            <span className="label">Vídeo ID</span>
            <input type="text" name={"url"} placeholder="Lj5Q6_o_yyw" />
          </label>
          {errors?.url && <ActionError actionData={{ error: errors.url }} />}
          <textarea
            className="w-full textarea mb-4"
            placeholder="Escribe la descripción..."
            name="description"
            rows={5}
          >
          </textarea>
          {errors?.description && <ActionError actionData={{ error: errors.description }} />}
          <>
            {categories?.length ? (
              <>
                <label className="fieldset-label">Categorías</label>
                <MultiSelectId name={"categories"} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={categories} />
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
        </fieldset>
      </Form>
    </div>
  );
}
