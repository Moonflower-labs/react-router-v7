import type { Route } from "./+types/list";
import { deleteProduct, getAllProducts } from "~/models/product.server";
import { Form, Link, Outlet } from "react-router";
import { FaEye } from "react-icons/fa";
import { ImBin } from "react-icons/im";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { syncStripeProducts } from "~/models/utils.server";
import { syncStripeShippingRates } from "~/models/utils.server";
import { getAllPlans } from "~/models/plan.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  // const page = Number((url.searchParams.get('page')) || 1);
  // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

  const products = await getAllProducts();
  const plans = await getAllPlans();

  return { products, plans, q: title };
}

export async function action({ request }: Route.ActionArgs) {
  switch (request.method) {
    case "POST": {
      await syncStripeProducts();
      await syncStripeShippingRates()
      return { success: true };
    }
    case "DELETE": {
      const formData = await request.formData()
      const productId = formData.get("productId")
      if (!productId) {
        return { error: "productId must be a string!" }
      }
      try {
        await deleteProduct(productId as string);
        break;
      } catch (error) {
        console.error(error)
        return { success: false }
      }

    }
    default:
      return { error: "Method not allowed" }
  }

}

export default function ListProducts({ loaderData }: Route.ComponentProps) {
  const { products, plans } = loaderData;

  return (
    <div className="p-6">
      <h1 className="text-3xl text-primary flex justify-center items-center gap-4 my-5">Productos</h1>
      {products?.length ? (
        products.map((product, index) => (
          <div
            key={product.id}
            className="flex flex-col lg:flex-row justify-between items-center gap-6 p-3 border border-primary/20 rounded-lg shadow-md md:w-2/3 mx-auto mb-6">
            <div className="avatar">
              <div className="w-12 rounded">
                <img src={product.thumbnail as string} alt="" className="avatar" />
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <span>
                {index + 1}. {product.name}{" "}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <Link to={`${product.id}/detail`} className="btn btn-circle btn-ghost shadow" viewTransition>
                <FaEye size={24} />
              </Link>

              <Link to={"create"} className="btn btn-circle btn-ghost shadow" viewTransition>
                <IoMdAdd size={24} className="text-success" />
              </Link>
              <Link to={`${product.id}/edit`} className="btn btn-circle btn-ghost shadow" viewTransition>
                <CiEdit size={24} className="text-info" />
              </Link>
              <Form method="DELETE" onSubmit={(e) => {
                if (!confirm(`Seguro que quieres borrar ${product.name}?`))
                  e.preventDefault();
              }}>
                <button type="submit" name="productId" value={product.id} className="btn btn-circle btn-ghost shadow">
                  <ImBin size={24} className="text-error" />
                </button>
              </Form>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col gap-4 justify-center items-center">
          <div>Todavía no hay ningún producto.</div>
          <Form method="post">
            <button type="submit" className="btn btn-primary btn-sm">
              Sync with Stripe
            </button>
          </Form>
        </div>
      )}
      <h2 className="text-2xl text-primary text-center font-bold my-4">Planes</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {plans.length > 0 && plans.map(plan =>
        (
          <div key={plan.id} className="card shadow">
            <div className="card-body">
              <div className="text-center">
                <h2 className="card-title w-fit mx-auto mb-2">{plan.name}</h2>
                <div className="avatar">
                  <div className="w-20 rounded-xl">
                    <img src={plan.thumbnail || "/logo.svg"} />
                  </div>
                </div>
              </div>
              <p>£{plan.amount / 100}</p>
              <p>{plan.priceId}</p>
              <div className="justify-end card-actions">
                <Form method="delete" onSubmit={(e) => {
                  if (!confirm(`Are you sure you want to delete ${plan.name}?`))
                    e.preventDefault();
                }}>
                  <button type="submit" name="planId" value={plan.id} className="btn btn-circle btn-ghost shadow">
                    <ImBin className="text-error" size={24} />
                  </button>
                </Form>
              </div>
            </div>
          </div>
        )
        )}
      </div>

      {/* <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> */}
      <Outlet />
    </div>
  );
}
