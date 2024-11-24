import { Form, Link } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/create";
import { getUserId } from "~/utils/session.server";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createPost } from "~/models/post.server";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { MultiSelectId } from "~/components/shared/multi-select";
import { Category } from "@prisma/client";

export async function loader() {
  const categories = await prisma.category.findMany();
  return categories;
}

interface Errors {
  title?: string;
  description?: string;
  categories?: string; // You can adjust this based on how you want to manage categories
}
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = (await getUserId(request)) as string;
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

  const post = await createPost(userId, title, String(description), categories, published);

  return { success: true, published };
}

export default function CreatePost({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const [selectedOptions, setSelectedOptions] = useState<Category[]>([]);

  useEffect(() => {
    if (actionData?.success && formRef?.current) {
      toast.success(`Post ${actionData?.published ? "pubicado" : "editado"} 👏🏽`);
      formRef.current.reset();
      setSelectedOptions([]);
    }
  }, [actionData]);

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">
        Crea un Post de <span className="font-bold">Personalidad</span>{" "}
      </h2>
      <Form ref={formRef} method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
        <input type="text" name={"title"} className="input input-bordered input-primary w-full mb-4" placeholder="Título" />
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <textarea className="w-full textarea textarea-primary mb-4" placeholder="Escribe el post..." name="description" rows={5}></textarea>
        {errors?.description && <ActionError actionData={{ error: errors.description }} />}

        <div>
          {loaderData?.length ? (
            <MultiSelectId name={"categories"} selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} options={loaderData} />
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
