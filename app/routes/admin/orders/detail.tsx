import { fetchOrder } from "~/models/order.server";
import type { Route } from "./+types/detail";
import { Form } from "react-router";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePendingActions } from "react-icons/md";
import { formatDate } from "~/utils/format";
import { useState } from "react";
import { toast } from "react-toastify";
import { LuCopy, LuCopyCheck } from "react-icons/lu";

export async function loader({ params }: Route.LoaderArgs) {
  const order = await fetchOrder(params.id);
  return order;
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
  const order = loaderData;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const emailToCopy = order?.user?.email as string;
    navigator.clipboard.writeText(emailToCopy)
      .then(() => {
        setCopied(true); // Set copied state to true
        setTimeout(() => setCopied(false), 10000); // Reset after 2 seconds
        toast.success("Email copiado")
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

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
          <button
            onClick={handleCopy}
            className="text-info"
          >
            {copied ? <LuCopyCheck size={24} /> : <LuCopy size={24} />}
          </button>
        </div>}

      <div className="flex flex-row gap-4 items-center mb-4">
        <div>
          {order?.status === "complete" ? <div className="badge badge-primary">Completado</div> : <div className="badge badge-secondary">Pendiente</div>}
        </div>
        <Form method="put" action="/admin/orders" navigate={false}>
          <input type="hidden" name="status" value={order?.status === "complete" ? "incomplete" : "complete"} />
          <button type="submit" name="orderId" value={order?.id} className="btn btn-sm btn-outline btn-info">
            {order?.status === "complete" ? <FaCheck /> : <MdOutlinePendingActions size={20} />}
          </button>
        </Form>
      </div>
      <h3 className="font-bold text-xl mb-4">Artículos:</h3>
      <div className="flex flex-col gap-4">
        {order?.orderItems.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-neutral-content/10 rounded-lg shadow p-3">
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
