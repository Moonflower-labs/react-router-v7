import type { Route } from "./+types/list";
import { Link, Outlet } from "react-router";
import { formatDate } from "~/utils/format";
import { fetchUserOrders, getUserOrderCount } from "~/models/order.server";
import { FaEye } from "react-icons/fa";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const title = url.searchParams.get("search");
    const userId = await requireUserId(request)

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
            <p className="mb-3 text-center">Pedidos completados <span className="badge badge-primary">{orderCount}</span></p>
            {orders?.length ? (
                orders.map((order, index) => (
                    <div
                        key={order.id}
                        className="flex flex-col lg:flex-row justify-between items-center gap-6 p-3 border rounded-lg shadow-md md:w-2/3 mx-auto mb-6">
                        <div className="flex justify-between items-center w-full">
                            <span>
                                {index + 1}. {order.id}{" "}
                            </span>
                            <span className="me-5">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            {order?.status === "Paid" ? (
                                <div className="badge badge-success">Pagada</div>
                            ) : (
                                <div className="badge badge-error">Pendiente</div>
                            )}
                            <Link to={`${order.id}`} className="btn btn-sm btn-outline btn-success" viewTransition>
                                <FaEye size={24} />
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
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
