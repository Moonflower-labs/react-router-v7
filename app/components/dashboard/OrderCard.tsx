import { use } from 'react'
import { GoArrowRight } from 'react-icons/go'
import { href, Link } from 'react-router'

export default function OrderCard({ count }: { count: Promise<number> }) {
    const orderCount = use(count)

    return (
        <div className="rounded-lg border shadow-lg p-4">
            <div className="flex flex-col justify-evenly gap-2 h-full">
                <h2 className="text-xl text-center text-primary font-semibold py-3">Mis Pedidos</h2>
                <div className="flex justify-between">
                    {orderCount && orderCount > 0 ?
                        <>
                            Pedidos realizados
                            <span className="badge badge-primary badge-outline">{orderCount}</span>
                        </>
                        : <span>Todavía no has hecho ningún pedido.</span>
                    }
                </div>
                <div className="flex justify-between">
                    <span>Aquí podrás ver tus pedidos</span>
                    <Link to={href("/profile/orders")} viewTransition><GoArrowRight size={24} /></Link>
                </div>
            </div>
        </div>
    )
}
