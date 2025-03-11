import type { Route } from "./+types/list";
import { Link, Outlet } from "react-router";
import { formatDate } from "~/utils/format";
import { fetchUserOrders, getUserOrderCount } from "~/models/order.server";
import { FaEye } from "react-icons/fa";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ request, context }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const title = url.searchParams.get("search");
    const userId = getSessionContext(context).get("userId");

    // const page = Number((url.searchParams.get('page')) || 1);
    // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

    const [orders, orderCount] = await Promise.all([
        fetchUserOrders(userId), getUserOrderCount(userId, "Paid")
    ])

    return { orders, q: title, orderCount };
}


export default function UserOrders({ loaderData }: Route.ComponentProps) {
    const { orders, orderCount } = loaderData;


    return (
        <div>
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Pedidos</h1>
            <p className="mb-3 text-center">Pedidos Realizados <span className="badge badge-ghost">{orderCount}</span></p>
            {orders?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3 mb-4">
                    {orders.map((order, index) => (
                        <div key={order.id} className="card card-md shadow-md border">
                            <div className="card-body">
                                <h2 className="card-title">{index + 1}. Pedido: {order.id}</h2>
                                <span className="me-5">{formatDate(order.createdAt)}</span>
                                <div className="flex gap-3 items-center lg:w-1/3">
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
                                </div>
                                <div className="justify-end card-actions">
                                    <button className="">
                                        <Link to={`${order.id}`} className="btn btn-sm btn-primary" viewTransition>
                                            Ver <FaEye size={22} />
                                        </Link>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>)
                : (
                    <div className="flex gap-4 justify-center items-center">
                        <span>No hay ningún pedido que mostrar.</span>
                    </div>
                )}
            {/*
             <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> 
            */}
            <Outlet />
        </div>
    );
}
