import { data, Form, Link, Outlet, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { formatDate } from "~/utils/format";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { deleteOrder, fetchOrders, getOrderCount, updateOrderStatus } from "~/models/order.server";
import { FaCheck } from "react-icons/fa";
import { FaEye } from "react-icons/fa";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");

  // const page = Number((url.searchParams.get('page')) || 1);
  // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

  const [orders, pendingOrderCount] = await Promise.all([
    fetchOrders(), await getOrderCount("Pending")
  ])

  return { orders, q: title, pendingOrderCount };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  const status = formData.get("status");

  if (!orderId) {
    throw data({ message: "No order ID provided" }, { status: 400 });
  }
  if (!status) {
    throw data({ message: "No status found!" }, { status: 400 });
  }
  let deleted = false;

  switch (request.method) {
    case "POST": {
      if (!status || String(status).toLowerCase() !== "complete") {
        throw data({ message: "Estas intentando borrar un pedido incompleto!" }, { status: 400 });
      }
      //  Delete the post
      await deleteOrder(String(orderId));
      deleted = true;
      break;
    }
    case "PUT": {
      await updateOrderStatus(String(orderId), String(status));
      break;
    }
    default:
      throw data({ message: "Method not allowed" }, { status: 400 });
  }

  return { success: true, deleted };
}

export default function ListOrders({ loaderData, actionData }: Route.ComponentProps) {
  const orders = loaderData?.orders;
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.success) {
      if (actionData?.deleted) {
        toast.success("Pedido eliminado");
      } else {
        toast.success("Estado actualizado!");
      }
    }
  }, [actionData]);

  const handleSbubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const orderId = form.orderId.value;
    const status = form.status.value;

    toast.warn(
      <div>
        <span>Quieres borrar este pedido?</span>
        <div>Asegúrate de que ha sido completado.</div>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              console.log("Submitting form:", event.target);
              submit({ orderId, status }, { method: "POST" });
            }}
            className="btn btn-sm btn-primary">
            Si
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-sm btn-primary">
            No
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        draggable: false
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Pedidos</h1>
      <p className="mb-3">Pedidos pendientes <span className="badge badge-primary">{loaderData?.pendingOrderCount}</span></p>
      {orders?.length ? (
        orders.map((order, index) => (
          <div
            key={order.id}
            className="flex flex-col lg:flex-row justify-between items-center gap-6 p-3 border border-primary/20 rounded-lg shadow-md md:w-2/3 mx-auto mb-6">
            <div className="flex justify-between items-center w-full">
              <span>
                {index + 1}. {order.id}{" "}
              </span>
              <span className="me-5">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex gap-3 items-center">
              {order?.status?.toLowerCase() === "succeeded" ? (
                <div className="badge badge-primary">Pagada</div>
              ) : (
                <div className="badge badge-error">Incompleta</div>
              )}
              <Link to={`${order.id}/detail`} className="btn btn-sm btn-outline btn-success" viewTransition>
                <FaEye size={24} />
              </Link>
              <Form method="put">
                <input type="hidden" name="status" value={order.status === "succeeded" ? "Pending" : "succeeded"} />
                <button type="submit" name="orderId" value={order.id} className=" btn btn-sm btn-outline btn-accent">
                  <FaCheck />
                </button>
              </Form>
              <Form method="post" onSubmit={handleSbubmit}>
                <input type="hidden" name="status" value={order.status} />
                <button type="submit" name="orderId" value={order.id} className=" btn btn-sm btn-outline btn-error">
                  <ImBin size={24} />
                </button>
              </Form>
            </div>
          </div>
        ))
      ) : (
        <div className="flex gap-4 justify-center items-center">
          <span>No hay ningún pedido que mostrar.</span>
        </div>
      )}
      {/* <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> */}
      <Outlet />
    </div>
  );
}
