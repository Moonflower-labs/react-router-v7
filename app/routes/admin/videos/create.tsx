import { Form, href, Link, redirect } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/create";
import { useRef } from "react";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { createVideo } from "~/models/video.server";
import { MultiSelectId } from "~/components/shared/multi-select";
import type { Section } from "@prisma/client";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader() {
  const categories = await prisma.category.findMany();
  return { categories };
}


export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = getSessionContext(context)
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
    await createVideo(String(section) as Section, title, String(description), String(url).trim(), categories, published);
    session.flash("toastMessage", { type: "success", message: "Vídeo creado 👏🏽" })

    return redirect(href("/admin/videos"))

  } catch (error) {
    console.error(error)
    session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })
  }
  return { success: false };
}

export default function CreateVideoBlog({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { categories } = loaderData
  const errors = actionData?.errors;



  return (
    <div className="text-center p-3">
      <h2 className="text-2xl text-primary my-5">
        Crea un Video de <span className="font-bold">Alma o Espíritu</span>
      </h2>
      <Form ref={formRef} method="post" className="w-full md:w-[65%] lg:w-1/3 mx-auto pb-4 flex flex-col">
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
        <label>
          <span className="label mb-2">Descripción</span>
          <textarea
            className="w-full textarea mb-4"
            placeholder="Escribe la descripción..."
            name="description"
            rows={5}
          >
          </textarea>
          {errors?.description && <ActionError actionData={{ error: errors.description }} />}
        </label>
        <>
          {categories?.length ? (
            <>
              <span className="label mb-2">Categorías</span>
              <MultiSelectId name={"categories"} defaultOptions={undefined} options={categories} />
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
