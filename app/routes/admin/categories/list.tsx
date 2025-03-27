import { prisma } from "~/db.server";
import type { Route } from "./+types/list";
import { CiEdit } from "react-icons/ci";
import { ImBin } from "react-icons/im";
import { IoMdAdd } from "react-icons/io";
import { Link, Form, Outlet, data, href } from "react-router";
import { formatDayTimeEs } from "~/utils/format";
import { deleteCategory } from "~/models/category.server";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Toaster } from "~/components/framer-motion/Toaster";

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
      toast.success(<Toaster message="Categoría eliminada" />);
    }
  }, [actionData]);

  return (
    <div className="min-h-screen w-full px-3">
      <h1 className="text-2xl text-primary text-center my-4">Lista de Categorías</h1>
      {categories?.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <div key={category.id} className="card bg-base-100 card-md shadow-sm">
              <div className="card-body">
                <h2 className="card-title">{category.name} </h2>
                <p>{formatDayTimeEs(category.createdAt)}</p>
                <div className="justify-end card-actions items-center">
                  <Link to={href('/admin/categories/create')} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <IoMdAdd size={24} className="text-success" />
                  </Link>
                  <Link to={href("/admin/categories/:id/edit", { id: category.id })} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                    <CiEdit size={24} className="text-info" />
                  </Link>
                  <Form method="post">
                    <button type="submit" name="categoryId" value={category.id} className="btn btn-sm btn-circle btn-ghost shadow">
                      <ImBin size={20} className="text-error" />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>
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
