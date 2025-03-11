import { fetchUserOrder } from "~/models/order.server";
import type { Route } from "./+types/detail";
import { formatDate } from "~/utils/format";
import { href } from "react-router";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ request, params, context }: Route.LoaderArgs) {
    const userId = getSessionContext(context).get("userId");
    const order = await fetchUserOrder(params.orderId, userId);
    return { order };
}

export default function OrderDetail({ loaderData, params }: Route.ComponentProps) {
    const { order } = loaderData;
    const total = order?.orderItems.reduce((total, cartItem) => {
        return total + cartItem.quantity * cartItem.price.amount / 100;
    }, 0);
    const shippingCost = order?.shippingRate?.amount ? order.shippingRate.amount / 100 : 0
    return (
        <div className="mb-6 lg:w-2/3 mx-auto px-4">
            <h2 className="text-xl text-primary text-center mx-auto my-5">
                Pedido realizado el <span className="font-bold">{formatDate(order?.createdAt)}</span>
            </h2>
            {order?.guest
                ? <p className="font-semibold mb-4 text-warning/75">Pedido de invitado</p>
                : <div className="flex flex-row gap-2 items-center mb-4">
                    <p className="font-semibold">Usuario: {order?.user?.username} / Email: {order?.user?.email}</p>
                </div>}

            <div className="flex flex-row flex-wrap gap-4 justify-center items-center mb-5">
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
                <div>
                    {order?.status === "Paid" ? <div className="badge badge-success">Pagado</div> : <div className="badge badge-secondary">Pendiente de pago</div>}
                </div>
                <div className="text-xl">Subtotal £{total}</div>
                <div className="text-xl">Envío £{shippingCost}</div>
                <div className="font-bold text-xl">Total £{Number(total) + shippingCost}</div>
            </div>

            <h3 className="font-bold text-xl mb-2.5">Artículos</h3>
            <div className="flex flex-col gap-4 mb-4">
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


            {/* todo ad shipping data */}
            <section className="p-4">
                <div className="mb-4">
                    <h3 className="font-bold text-xl mb-3">Envío Postal</h3>
                    <span>£{shippingCost}</span>

                    <div>{order?.shippingRate?.displayName} </div>
                </div>
                <div className="mb-4">
                    <h3 className="font-bold text-xl mb-3">Direción Postal:</h3>
                    <div>{order?.shippingAddress?.line1}</div>
                    <div>{order?.shippingAddress?.line2}</div>
                    <div>Estado: {order?.shippingAddress?.state}</div>
                    <div>Ciudad: {order?.shippingAddress?.city}</div>
                    <div>País: {order?.shippingAddress?.country}</div>
                    <div>Código Postal: {order?.shippingAddress?.postalCode}</div>
                </div>
                <div className="py-4 w-full text-center">
                    <a href={href("/api/order/:orderId/pdf", { orderId: params.orderId })} className="btn btn-warning">Descargar factura en PDF</a>
                </div>
            </section>
        </div>
    );
}
