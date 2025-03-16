import { createLiveSession } from "~/utils/chat.server";
import type { Route } from "./+types/create";
import { Form, href, redirect, useNavigation } from "react-router";
import { getSessionContext } from "~/middleware/sessionMiddleware";


export async function action({ request, context }: Route.ActionArgs) {
    const formData = await request.formData();
    const session = getSessionContext(context)
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const description = formData.get("description");
    const name = formData.get("name");
    const link = formData.get("link");


    try {
        await createLiveSession({
            name: name as string,
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
            description: description as string,
            link: link as string
        });

    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return {};
    }
    session.flash("toastMessage", { type: "success", message: "Sesión creada 👏🏽" })
    return redirect(href("/admin/live-sessions"));
}


export default function CreateSession({ }: Route.ComponentProps) {
    const navigation = useNavigation()

    return (
        <main className="p-4">
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Crea una Sessión</h1>
            <Form method="POST" >
                <div className="card gap-4 w-fit items-center p-6 mx-auto">
                    <label className="input input-lg">
                        <span className="label">Nombre</span>
                        <input type="text" placeholder="Nombre de la sesión" name="name" />
                    </label>
                    <label className="input">
                        <span className="label">Comienzo</span>
                        <input type="datetime-local" name="startDate" required />
                    </label>
                    <label className="input">
                        <span className="label">Finaliza</span>
                        <input type="datetime-local" name="endDate" required />
                    </label>
                    <label className="input input-lg">
                        <span className="label">Link</span>
                        <input type="text" placeholder="Link a la sesión en Telegram" name="link" required />
                    </label>
                    <label className="textarea textarea-lg">
                        <span className="label">Descripción</span>
                        <textarea name="description" id="description" className="w-full" rows={6} required />
                    </label>
                    <button type="submit" className="btn btn-primary" disabled={navigation.state !== "idle"}>Crear Sesión</button>
                </div>
            </Form>
        </main>
    )
}
