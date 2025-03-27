import { Form, useNavigate } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/create";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { prisma } from "~/db.server";
import { createCategory } from "~/models/category.server";
import { Toaster } from "~/components/framer-motion/Toaster";

export async function loader() {
  const categories = await prisma.category.findMany();
  return categories;
}

interface Errors {
  name?: string;
  description?: string;
  section?: string;
}
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;

  let errors: Errors = {};
  if (!name) {
    errors.name = "Escribe el nombre de la categoría";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await createCategory(name);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export default function CreateCategory({ actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const errors = actionData?.errors;
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.success && formRef?.current) {
      toast.success(<Toaster message="Categoría creada 👏🏽" />);
      formRef.current.reset();
      navigate(-1);
    }
  }, [actionData]);

  return (
    <div className="min-h-screen text-center w-full">
      <h2 className="text-2xl text-primary my-5">Añade una categoría</h2>
      <Form ref={formRef} method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
        <input type="text" name={"name"} className="input input-bordered input-primary w-full mb-4" placeholder="Nombre" />
        {errors?.name && <ActionError actionData={{ error: errors.name }} />}

        <div className="flex justify-end gap-3 mt-8">
          <button type="reset" className="btn btn-primary btn-outline btn-sm">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
            Publicar
          </button>
        </div>
      </Form>
    </div>
  );
}
