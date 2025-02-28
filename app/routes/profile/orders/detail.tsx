import { fetchUserOrder } from "~/models/order.server";
import type { Route } from "./+types/detail";
import { formatDate } from "~/utils/format";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request, params }: Route.LoaderArgs) {
    const userId = await requireUserId(request)
    const order = await fetchUserOrder(params.orderId, userId);
    return { order };
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
    const { order } = loaderData;
    const total = order?.orderItems.reduce((total, cartItem) => {
        return total + cartItem.quantity * cartItem.price.amount / 100;
    }, 0);
    return (
        <div className="mb-6 lg:w-2/3 mx-auto px-3">
            <h2 className="text-xl text-primary text-center mx-auto my-5">
                Pedido realizado el <span className="font-bold">{formatDate(order?.createdAt)}</span>
            </h2>
            {order?.guest
                ? <p className="font-semibold mb-4 text-warning/75">Pedido de invitado</p>
                : <div className="flex flex-row gap-2 items-center mb-4">
                    <p className="font-semibold">Usuario: {order?.user?.username} / Email: {order?.user?.email}</p>
                </div>}

            <div className="flex flex-row gap-4 items-center mb-5">
                <div>
                    {order?.status === "Paid" ? <div className="badge badge-success">Pagada</div> : <div className="badge badge-secondary">Pendiente de pago</div>}
                </div>
                <div className="font-bold text-xl">Total £{total}</div>
            </div>

            <h3 className="font-bold text-xl mb-2.5">Artículos</h3>
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
