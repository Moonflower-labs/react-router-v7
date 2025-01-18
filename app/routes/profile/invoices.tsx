import { getCustomerId } from "~/integrations/stripe";
import type { Route } from "./+types/invoices";
import { requireUserId } from "~/utils/session.server";
import { listInvoices } from "~/integrations/stripe/invoice.server";
import { Link, redirect } from "react-router";
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
        <div className="min-h-[75vh] text-center">
            <h2 className="text-3xl text-primary font-bold py-4">Facturas</h2>
            {invoiceList.length > 0
                ? invoiceList.map(invoice =>
                    <div key={invoice.id} className="flex flex-col gap-3 justify-center">
                        <div className="border shadow rounded-md md:w-64 mb-3 mx-auto">
                            <Link to={invoice.hosted_invoice_url || ""} target="_blank" className="link link-primary">{formatUnixDate(invoice.created)}</Link>
                            <Link to={invoice.invoice_pdf!} title="Descargar pdf" className="flex flex-row gap-3 p-2 justify-center" >Descargar <FaFilePdf size={24} className="text-error/80" /></Link>
                        </div>
                    </div>
                )
                : <div>No hay facturas que mostrar todavía</div>}
        </div>
    )
}
