import { data, Form, Link, Outlet, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { ImBin } from "react-icons/im";
import { useEffect, useState } from "react";
import { toast, type Id } from "react-toastify";
import { deleteOrder, fetchOrders, getOrderCount, updateOrderProcessStatus } from "~/models/order.server";
import { FaCheck } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import type { OrderStatus } from "@prisma/client";
import { GrRevert } from "react-icons/gr";
import { formatDayTimeEs } from "~/utils/format";
import { CustomAlert } from "~/components/shared/info";
import { Toaster } from "~/components/framer-motion/Toaster";

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
        toast.success(<Toaster message={"Pedido eliminado"} />);
      } else {
        toast.success(<Toaster message={"Estado actualizado!"} />);
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
      <CustomAlert level="warning" className="!m-0">
        <span>Quieres borrar el pedido {event.currentTarget.dataset.orderid}?</span>
        <div>Asegúrate de que ha sido completado.</div>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              submit({ orderId, status, isProcessed }, { method: "DELETE" });
            }}
            className="btn btn-sm btn-warning w-1/3">
            Aceptar
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-sm btn-primary btn-outline w-1/3">
            Cancelar
          </button>
        </div>
      </CustomAlert>,
      {
        className: "!p-0 !m-0 !bg-base-100 !border-none !shadow-none",
      }
    );
    setToastId(_toastId);
  };

  return (
    <div className="px-2.5 py-4">
      <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Pedidos</h1>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
          <div className="flex gap-2">
            <div>
              Pendientes <span className="badge badge-xs badge-primary">{loaderData?.pendingOrderCount}</span>
            </div>
            <div>
              En Proceso <span className="badge badge-xs badge-warning">{loaderData?.orders.filter((o) => !o.isProcessed && o.status === "Paid").length}</span>
            </div>
          </div>
        </li>

        {orders?.length ? (
          orders.map((order, index) => (
            <li className={`list-row ${order.id === orderId ? "border-warning border-2" : ""} `}
              key={order.id}
            >
              <div className="text-4xl font-thin opacity-30 tabular-nums"> {index + 1}</div>
              <div>
                <div>{order.id}</div>
                <div className="text-xs uppercase font-semibold opacity-60">{formatDayTimeEs(order.updatedAt)}</div>
              </div>
              <div className="flex flex-col md:flex-row gap-1.5 items-center">
                {order?.status === "Paid" ? (
                  <div className="badge badge-xs badge-success opacity-80">Pagado</div>
                ) : (
                  <div className="badge badge-xs badge-error opacity-70">Pendiente</div>
                )}
                {order?.isProcessed ? (
                  <div className="text-xs">
                    <div className="inline-grid *:[grid-area:1/1]">
                      <div className="status status-success"></div>
                    </div> Procesado
                  </div>
                ) : (
                  <div className="text-xs">
                    <div className="inline-grid *:[grid-area:1/1]">
                      <div className="status status-warning animate-ping"></div>
                      <div className="status status-warning"></div>
                    </div>
                    {" "}En proceso
                  </div>
                )}
              </div>
              <div className="list-col-wrap flex gap-1.5 justify-end items-center">
                <Link to={`${order.id}/detail`} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                  <FaEye size={24} />
                </Link>
                <Form method="PUT">
                  <input type="hidden" name="isProcessed" value={order.isProcessed ? "false" : "true"} />
                  <button type="submit" name="orderId" value={order.id} className={`btn btn-sm btn-circle btn-ghost shadow btn-${order?.isProcessed ? "warning" : "success"}`}>
                    {order?.isProcessed ? <GrRevert size={20} /> : <FaCheck size={20} />}
                  </button>
                </Form>
                <Form method="DELETE" onSubmit={handleSbubmit} data-orderid={order.id}>
                  <input type="hidden" name="status" value={order.status} />
                  <input type="hidden" name="isProcessed" value={order.isProcessed ? "true" : "false"} />
                  <input type="hidden" name="date" value={order.createdAt.toISOString()} />
                  <button type="submit" name="orderId" value={order.id} className="btn btn-sm btn-circle btn-ghost shadow">
                    <ImBin size={24} className="text-error" />
                  </button>
                </Form>
              </div>
            </li>
          ))
        ) : (
          <div className="flex gap-4 justify-center items-center">
            <span>No hay ningún pedido que mostrar.</span>
          </div>
        )}
      </ul>
      {/* <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> */}
      <Outlet />
    </div>
  );
}
