import { fetchOrder } from "~/models/order.server";
import type { Route } from "./+types/detail";
import { Form } from "react-router";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { formatDate } from "~/utils/format";
import { CopyToClipBoard } from "~/components/shared/CopyToClipBoard";

export async function loader({ params }: Route.LoaderArgs) {
  const order = await fetchOrder(params.id);
  return order;
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
  const order = loaderData as any;
  // console.log(order)

  return (
    <div className="mb-6 lg:w-2/3 mx-auto">
      <h2 className="text-xl text-primary text-center mx-auto my-5">
        Detalles del pedido: <span className="font-bold">{order?.id}</span>
      </h2>
      <p className="font-semibold mb-4">Fecha: {formatDate(order?.createdAt)}</p>
      {order?.guest
        ? <p className="font-semibold mb-4 text-warning/75">Pedido de invitado</p>
        : <div className="flex flex-row gap-2 items-center mb-4">
          <p className="font-semibold">Usuario: {order?.user?.username} / Email: {order?.user?.email}</p>
          <CopyToClipBoard href={order?.user?.email as string} />
        </div>}

      <div className="flex flex-row gap-4 items-center mb-4">
        <div>
          {order?.status === "succeeded" ? <div className="badge badge-primary">Pagada</div> : <div className="badge badge-secondary">Pendiente de pago</div>}
        </div>
        <Form method="put" action="/admin/orders" navigate={false}>
          <input type="hidden" name="status" value={order?.status === "succeeded" ? "incomplete" : "succeeded"} />
          <button type="submit" name="orderId" value={order?.id} className="btn btn-sm btn-outline btn-info">
            {order?.status === "succeeded" ? <FaCheck /> : <MdOutlinePendingActions size={20} />}
          </button>
        </Form>
      </div>
      <h3 className="font-bold text-xl mb-4">Artículos:</h3>
      <div className="flex flex-col gap-4">
        {order?.orderItems.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 bg-neutral-content/10 rounded-lg shadow-sm p-3">
            <div className="avatar">
              <div className="w-12 rounded">
                <img src={item.product.thumbnail as string} alt={item.product.name} />
              </div>
            </div>
            <div>
              <div>{item.product.name}</div>
              <div>
                <span className="font-bold">Info:</span> {item.price.info}
              </div>
              <div>
                <span className="font-bold">Cantidad:</span> {item.quantity}
              </div>
              <div>
                £{item.price.amount / 100} x {item.quantity}= £{(item.price.amount * item.quantity) / 100}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
