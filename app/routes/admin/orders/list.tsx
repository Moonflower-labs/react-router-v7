import { data, Form, Link, Outlet, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { formatDate } from "~/utils/format";
import { ImBin } from "react-icons/im";
import { useEffect, useState } from "react";
import { toast, type Id } from "react-toastify";
import { deleteOrder, fetchOrders, getOrderCount, updateOrderProcessStatus } from "~/models/order.server";
import { FaCheck } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import type { OrderStatus } from "@prisma/client";
import { GrRevert } from "react-icons/gr";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");

  // const page = Number((url.searchParams.get('page')) || 1);
  // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

  const [orders, pendingOrderCount] = await Promise.all([
    fetchOrders(), getOrderCount("Pending")
  ])

  return { orders, q: title, pendingOrderCount };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const orderId = formData.get("orderId");
  const status = formData.get("status") as OrderStatus;
  const isProcessed = formData.get("isProcessed");
  const date = formData.get("date");
  const orderDate = new Date(date as string);
  orderDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!orderId) {
    throw data({ message: "No order ID provided" }, { status: 400 });
  }

  let deleted = false;

  switch (request.method) {
    case "DELETE": {
      // todo fix this condition
      if (!status || (isProcessed === "false" && status === "Paid" && orderDate.getTime() >= today.getTime())) {
        throw data({ message: "Estas intentando borrar un pedido sin procesar de hoy!" }, { status: 400 });
      }
      try {
        //  Delete the post
        await deleteOrder(String(orderId));
        deleted = true;
      } catch (error) {
        console.error(error)
      }
      break;
    }
    case "PUT": {
      await updateOrderProcessStatus(String(orderId), Boolean(isProcessed === "true"))
      break;
    }
    default:
      throw data({ message: "Method not allowed" }, { status: 400 });
  }

  return { success: true, deleted };
}

export default function ListOrders({ loaderData, actionData }: Route.ComponentProps) {
  const { orders } = loaderData;
  const submit = useSubmit();
  const [toastId, setToastId] = useState<Id | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

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
    const isProcessed = form.isProcessed.value;
    setOrderId(orderId);
    if (toastId) {
      toast.dismiss(toastId);
      setToastId(null)
    }
    const _toastId = toast.warn(
      <div>
        <span>Quieres borrar este pedido?</span>
        <div>Asegúrate de que ha sido completado.</div>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              submit({ orderId, status, isProcessed }, { method: "DELETE" });
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
        autoClose: false,
      }
    );
    setToastId(_toastId);
  };

  return (
    <div>
      <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Pedidos</h1>
      <p className="mb-3 text-center">Pedidos pendientes <span className="badge badge-primary">{loaderData?.pendingOrderCount}</span></p>
      {orders?.length ? (
        orders.map((order, index) => (
          <div
            key={order.id}
            className={`flex flex-col lg:flex-row justify-between items-center gap-6 p-3 border ${order.id === orderId ? "border-warning border-2" : ""} rounded-lg shadow-md md:w-2/3 mx-auto mb-6`}>
            <div className="flex justify-between items-center w-full">
              <span>
                {index + 1}. {order.id}{" "}
              </span>
              <span className="me-5">{formatDate(order.updatedAt)}</span>
            </div>
            <div className="flex gap-3 items-center">
              {order?.status === "Paid" ? (
                <div className="badge badge-success">Pagado</div>
              ) : (
                <div className="badge badge-error">Pendiente</div>
              )}
              {order?.isProcessed ? (
                <>
                  <div className="inline-grid *:[grid-area:1/1]">
                    <div className="status status-success"></div>
                  </div> Procesado
                </>
              ) : (
                <>
                  <div className="inline-grid *:[grid-area:1/1]">
                    <div className="status status-warning animate-ping"></div>
                    <div className="status status-warning"></div>
                  </div>
                  En proceso
                </>
              )}
              <Link to={`${order.id}/detail`} className="btn btn-sm btn-outline btn-success" viewTransition>
                <FaEye size={24} />
              </Link>
              <Form method="PUT">
                <input type="hidden" name="isProcessed" value={order.isProcessed ? "false" : "true"} />
                <button type="submit" name="orderId" value={order.id} className={`btn btn-sm btn-${order?.isProcessed ? "warning" : "success"}`}>
                  {order?.isProcessed ? <GrRevert size={20} /> : <FaCheck size={20} />}
                </button>
              </Form>

              <Form method="DELETE" onSubmit={handleSbubmit}>
                <input type="hidden" name="status" value={order.status} />
                <input type="hidden" name="isProcessed" value={order.isProcessed ? "true" : "false"} />
                <input type="hidden" name="date" value={order.createdAt.toISOString()} />
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
