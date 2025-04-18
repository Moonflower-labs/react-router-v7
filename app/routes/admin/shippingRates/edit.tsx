import { Form, href, redirect } from "react-router";
import ActionError from "~/components/framer-motion/ActionError";
import type { Route } from "./+types/edit";
import { useRef } from "react";
import { getSessionContext } from "~/middleware/sessionMiddleware";
import { editShippinRate, getShippinRate } from "~/models/shippingRate";


export async function loader({ params }: Route.LoaderArgs) {
    const { id } = params
    if (!id) {
        throw new Error("Params required")
    }
    return getShippinRate(id)

}


export async function action({ request, params, context }: Route.ActionArgs) {
    const formData = await request.formData();
    const session = getSessionContext(context)
    const displayName = formData.get("displayName") as string;
    const amountString = formData.get("amount");
    const amount = amountString ? parseInt(String(amountString)) : 0;
    const { id } = params
    let errors: any = {};
    if (!displayName) {
        errors.displayName = "Escribe una descripción";
    }

    if (!amountString || amount < 0) {
        errors.amount = "Precio debe de ser un número";
    }
    if (Object.keys(errors).length > 0) {
        return { errors };
    }


    try {
        await editShippinRate({ id, displayName, amount });
        session.flash("toastMessage", { type: "success", message: "Shipping Rate creado 👏🏽" })

        return redirect(href("/admin/shippingRates"))

    } catch (error) {
        console.error(error)
        session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })
    }
    return { success: false }
}

export default function Component({ loaderData, actionData }: Route.ComponentProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const errors = actionData?.errors;


    return (
        <div className="text-center">
            <h2 className="text-2xl text-primary my-5">
                Edita el Shipping Rate
            </h2>
            <Form ref={formRef} method="post" className="card max-w-xs items-center mx-auto pb-4 flex flex-col">
                <label className="input input-lg mb-3">
                    <span className="label">Descripción</span>
                    <input type="text" name={"displayName"} placeholder="Free shipping..." defaultValue={loaderData?.displayName} />
                </label>
                {errors?.displayName && <ActionError actionData={{ error: errors.displayName }} />}

                <fieldset className="fieldset">
                    <label className="input input-lg mb-3">
                        <span className="label">Precio</span>
                        <input type="number" min={0} name={"amount"} defaultValue={loaderData?.amount} />
                    </label>
                    {errors?.amount && <ActionError actionData={{ error: errors.amount }} />}
                    <p className="fieldset-label">⚠️ En céntimos, £1 = 100</p>
                </fieldset>

                <div className="flex justify-end gap-3 mt-8">
                    <button type="reset" className="btn btn-primary btn-outline btn-sm">
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
                        Publicar
                    </button>
                </div>
            </Form>
        </div>
    );
}
