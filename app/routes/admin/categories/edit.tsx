import { Form, href, redirect, useNavigation } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { useRef } from "react";
import { prisma } from "~/db.server";
import { editCategory } from "~/models/category.server";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ params }: Route.LoaderArgs) {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  return { category };
}

interface Errors {
  name?: string;
  description?: string;
  categories?: string; // You can adjust this based on how you want to manage categories
}
export async function action({ request, params, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = getSessionContext(context);
  const name = formData.get("name") as string;

  let errors: Errors = {};
  if (!name) {
    errors.name = "Escribe un título";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await editCategory(params.id, name);
  } catch (error) {
    console.error(error)
    const successMsg = { type: "error", message: "Ha ocurrido un error" }
    session.flash("toastMessage", successMsg)
    return { success: false };
  }
  const successMsg = { type: "success", message: "Categoría editada 👏🏽" }
  session.flash("toastMessage", successMsg)
  return redirect(href("/admin/categories"))
}

export default function EditCategory({ loaderData, actionData }: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation()
  const errors = actionData?.errors;
  const category = loaderData?.category;



  return (
    <div className="min-h-screen text-center w-full">
      <h2 className="text-2xl text-primary my-5">Edita la categoría</h2>
      <Form ref={formRef} method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
        <input type="text" name={"name"} className="input input-bordered input-primary w-full mb-4" placeholder="Nombre" defaultValue={category?.name} />
        {errors?.name && <ActionError actionData={{ error: errors.name }} />}
        <div className="flex justify-end gap-3 mt-8">
          <button type="reset" className="btn btn-primary btn-outline btn-sm">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"} disabled={navigation.state !== "idle"}>
            Guardar cambios
          </button>
        </div>
      </Form>
    </div>
  );
}
