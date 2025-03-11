import { prisma } from "~/db.server";
import type { Route } from "./+types/list";
import { CiEdit } from "react-icons/ci";
import { ImBin } from "react-icons/im";
import { IoMdAdd } from "react-icons/io";
import { Link, Form, Outlet, data, href } from "react-router";
import { formatDate } from "~/utils/format";
import { deleteShippinRate } from "~/models/shippingRate";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader() {
    const shippingRates = await prisma.shippingRate.findMany();
    return { shippingRates }
}

export async function action({ request, context }: Route.ActionArgs) {
    const formData = await request.formData();
    const session = getSessionContext(context)
    const shippingRateId = formData.get("shippingRateId");

    if (!shippingRateId) {
        throw data({ message: "No category ID provided" }, { status: 400 });
    }
    try {
        //  Delete the rate
        await deleteShippinRate(String(shippingRateId));
    } catch (error) {
        console.error(error)
        session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })

        return { success: false };
    }
    session.flash("toastMessage", { type: "success", message: "Rate eliminado 👏🏽" })
    return { success: true };
}

export default function Component({ loaderData }: Route.ComponentProps) {
    const { shippingRates } = loaderData;


    return (
        <div className="min-h-screen w-full px-3">
            <h1 className="text-2xl text-primary text-center my-4">Envío Postal</h1>
            {shippingRates?.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {shippingRates.map(rate => (
                        <div key={rate.id} className="card bg-base-100 card-md shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title">{rate.displayName}</h2>
                                <p>{formatDate(rate.createdAt)}</p>
                                <p>£{rate.amount / 100}</p>
                                <div className="justify-end card-actions items-center">
                                    <Link to={href("/admin/shippingRates/create")} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                                        <IoMdAdd size={24} className="text-success" />
                                    </Link>
                                    <Link to={href("/admin/shippingRates/:id/edit", { id: rate.id })} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                                        <CiEdit size={24} className="text-info" />
                                    </Link>
                                    <Form method="post">
                                        <button type="submit" name="shippingRateId" value={rate.id} className="btn btn-sm btn-circle btn-ghost shadow">
                                            <ImBin size={20} className="text-error" />
                                        </button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex gap-6 justify-center items-center my-5">
                    No hay shipping rates todavía 😩. Añade alguno{" "}
                    <Link to={href("/admin/shippingRates/create")} className="btn btn-ghost btn-sm">
                        <IoMdAdd size={24} className="text-green-600" />
                    </Link>
                </div>
            )}
            <Outlet />
        </div>
    );
}
