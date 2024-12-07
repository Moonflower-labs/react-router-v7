import { Form, Link, useNavigate } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { getUserId } from "~/utils/session.server";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { editPost, fetchPost } from "~/models/post.server";
import { prisma } from "~/db.server";
import { IoMdAdd } from "react-icons/io";
import { MultiSelectId } from "~/components/shared/multi-select";
import type { Category } from "@prisma/client";

export async function loader({ params }: Route.LoaderArgs) {
  const post = await fetchPost(params.id);
  const categories = await prisma.category.findMany();
  return { post, categories };
}

interface Errors {
  title?: string;
  description?: string;
  categories?: string; // You can adjust this based on how you want to manage categories
}
export async function action({ request, params }: Route.ActionArgs) {
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

  await editPost(params.id, userId, title, String(description), categories, published);

  return { success: true, published };
}

export default function EditPost({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const post = loaderData?.post;
  const categories = loaderData?.categories;
  const [selectedOptions, setSelectedOptions] = useState<Category[]>(post?.categories || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success && formRef?.current) {
      toast.success(`Post ${actionData?.published ? "pubicado" : "editado"} 👏🏽`);
      navigate("/admin/post");
    }
  }, [actionData]);

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-5">
        Editar Post de <span className="font-bold">Personalidad</span>{" "}
      </h2>
      <Form ref={formRef} method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
        <input type="text" name={"title"} className="input input-bordered w-full mb-4" placeholder="Título" defaultValue={post?.title} />
        {errors?.title && <ActionError actionData={{ error: errors.title }} />}
        <textarea
          className="w-full textarea textarea-bordered mb-4"
          placeholder="Escribe el post..."
          name="description"
          rows={5}
          defaultValue={post?.description}></textarea>
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
          <button type="reset" className="btn btn-primary btn-outline btn-sm">
            Cancelar
          </button>
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
