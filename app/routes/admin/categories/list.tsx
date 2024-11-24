import { prisma } from "~/db.server";
import type { Route } from "./+types/list";
import { CiEdit } from "react-icons/ci";
import { ImBin } from "react-icons/im";
import { IoMdAdd } from "react-icons/io";
import { Link, Form, Outlet, data } from "react-router";
import { formatDate } from "~/utils/format";
import { deleteCategory } from "~/models/category.server";
import { useEffect } from "react";
import { toast } from "react-toastify";

export async function loader() {
  return prisma.category.findMany();
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const categoryId = formData.get("categoryId");

  if (!categoryId) {
    throw data({ message: "No category ID provided" }, { status: 400 });
  }
  //  Delete the post
  await deleteCategory(String(categoryId));

  return { success: true };
}

export default function CategoryList({ loaderData, actionData }: Route.ComponentProps) {
  const categories = loaderData;

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Categoría eliminada");
    }
  }, [actionData]);

  return (
    <div className="min-h-screen w-full px-3">
      <h1 className="text-2xl text-primary text-center my-4">Lista de Categorías</h1>
      {categories?.length ? (
        categories.map(category => (
          <div key={category.id} className="flex justify-between items-center p-3 border border-primary/20 rounded-lg shadow-md mb-3 lg:w-2/3 mx-auto">
            {category.name} {formatDate(category.createdAt)}
            <div className="flex gap-3 items-center">
              <Link to={"create"} className="btn btn-sm btn-outline btn-success" viewTransition>
                <IoMdAdd size={24} />
              </Link>
              <Link to={`${category.id}/edit`} className="btn btn-sm btn-outline btn-info" viewTransition>
                <CiEdit size={24} />
              </Link>
              <Form method="post">
                <button type="submit" name="categoryId" value={category.id} className="btn btn-sm btn-outline btn-error">
                  <ImBin size={24} />
                </button>
              </Form>
            </div>
          </div>
        ))
      ) : (
        <div className="flex gap-6 justify-center items-center my-5">
          No hay categorías todavía 😩. Añade alguna{" "}
          <Link to={"create"} className="btn btn-ghost btn-sm">
            <IoMdAdd size={24} className="text-green-600" />
          </Link>
        </div>
      )}
      <Outlet />
    </div>
  );
}
