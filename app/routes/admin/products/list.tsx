import { getUserId, requireUserId } from "~/utils/session.server";
import type { Route } from "./+types/list";
import { getAllProducts } from "~/models/product.server";
import { Form, Link, Outlet } from "react-router";
import { FaEye } from "react-icons/fa";
import { ImBin } from "react-icons/im";
import { formatDate } from "~/utils/format";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { syncStripeProducts } from "~/models/cart.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  // const page = Number((url.searchParams.get('page')) || 1);
  // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

  const products = await getAllProducts();

  return { products, q: title };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  if (request.method === "POST") {
    const products = await syncStripeProducts();
    return { success: true };
  }

  return null;
}

export default function ListProducts({ loaderData }: Route.ComponentProps) {
  const products = loaderData?.products;

  return (
    <div>
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
              <span className="me-5">{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex gap-3 items-center">
              <Link to={`${product.id}/detail`} className="btn btn-sm btn-outline btn-success" viewTransition>
                <FaEye size={24} />
              </Link>

              <Link to={"create"} className="btn btn-sm btn-outline btn-success" viewTransition>
                <IoMdAdd size={24} />
              </Link>
              <Link to={`${product.id}/edit`} className="btn btn-sm btn-outline btn-info" viewTransition>
                <CiEdit size={24} />
              </Link>
              <Form method="post">
                <button type="submit" name="orderId" value={product.id} className=" btn btn-sm btn-outline btn-error">
                  <ImBin size={24} />
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
      {/* <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> */}
      <Outlet />
    </div>
  );
}
