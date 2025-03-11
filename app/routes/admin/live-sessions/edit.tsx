import { editSession, getSession } from "~/utils/chat.server";
import type { Route } from "./+types/edit";
import { Form, href, redirect, useNavigation } from "react-router";
import { getSessionContext } from "~/utils/contexts.server";

export async function loader({ params }: Route.LoaderArgs) {
    const session = await getSession(params.sessionId)
    return { session }
}

export async function action({ request, params, context }: Route.ActionArgs) {
    const formData = await request.formData();
    const session = getSessionContext(context)
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const description = formData.get("description");
    const name = formData.get("name");
    const link = formData.get("link");

    try {

        await editSession({
            id: params.sessionId,
            name: name as string,
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
            description: description as string,
            link: link as string
        })

    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
    session.flash("toastMessage", { type: "success", message: "Sesión editada 👏🏽" })
    return redirect(href("/admin/live-sessions"));
}


export default function EditSession({ loaderData }: Route.ComponentProps) {
    const { session } = loaderData
    const navigation = useNavigation()

    return (
        <main>
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Edita la Sessión</h1>
            <Form method="PUT">
                <div className="card gap-4 w-fit items-center p-6 mx-auto">
                    <label className="input input-lg">
                        <span className="label">Nombre</span>
                        <input type="text" placeholder="Nombre de la sesión" name="name" defaultValue={session?.name} />
                    </label>
                    <label className="input">
                        <span className="label">Comienzo</span>
                        <input type="datetime-local" name="startDate" defaultValue={session?.startDate
                            ? new Date(session.startDate).toISOString().slice(0, 16)
                            : ""} required />
                    </label>
                    <label className="input">
                        <span className="label">Finaliza</span>
                        <input type="datetime-local" name="endDate" defaultValue={session?.endDate ? new Date(session.endDate).toISOString().slice(0, 16) : ""} required />
                    </label>
                    <label className="input input-lg">
                        <span className="label">Link</span>
                        <input type="text" placeholder="Link a la sesión en Telegram" name="link" defaultValue={session?.link} required />
                    </label>
                    <label className="textarea textarea-lg">
                        <span className="label  mb-2">Descripción</span>
                        <textarea name="description" rows={6} defaultValue={session?.description || ""} required />
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={navigation.state !== "idle"}>Editar Sesión</button>
                </div>
            </Form>
        </main>
    )
}
