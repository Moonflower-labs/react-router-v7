import { getCustomerId } from "~/integrations/stripe";
import type { Route } from "./+types/invoices";
import { requireUserId } from "~/utils/session.server";
import { listInvoices } from "~/integrations/stripe/invoice.server";
import { href, Link, redirect } from "react-router";
import { formatUnixDate } from "~/utils/format";
import { FaFilePdf } from "react-icons/fa";


export async function loader({ request }: Route.LoaderArgs) {
    const userId = await requireUserId(request)
    const customerId = await getCustomerId(userId)
    if (!customerId) {
        throw redirect("/")
    }
    const invoices = await listInvoices(customerId)

    return { invoices }
}

export default function ListInvoices({ loaderData }: Route.ComponentProps) {

    const invoiceList = loaderData?.invoices

    return (
        <div className="min-h-[75vh] text-center p-4">
            <h2 className="text-3xl text-primary font-bold py-4">Facturas</h2>
            <p className="py-3 mb-2">Estas factutas son solo de Suscripción. Para facturas de pedidos visita <Link to={href("/profile/orders")} className="link link-primary">Mis Pedidos</Link>.</p>
            {invoiceList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {invoiceList.map(invoice =>
                        <div
                            key={invoice.id}
                            className="card w-96 bg-base-200/40 card-md shadow-sm mx-auto">
                            <div className="card-body">
                                <h2 className="card-title">Cliente {invoice.customer_name}</h2>
                                <span>Fecha: {formatUnixDate(invoice.created)}</span>
                                {invoice.lines.data && invoice.lines.data.map((line) => (
                                    <span key={line.id}>{line.description}</span>
                                ))}
                                <span>TOTAL £{invoice.total / 100}</span>
                                <div className="justify-between card-actions mt-4">
                                    <Link to={invoice.hosted_invoice_url || ""} target="_blank" className="btn btn-sm btn-primary">Ver Online</Link>
                                    <Link to={invoice.invoice_pdf!} title="Descargar pdf" className="btn btn-sm btn-outline btn-primary" >Descargar <FaFilePdf size={24} /></Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div>No hay facturas que mostrar todavía</div>
            )}
        </div>
    )
}
