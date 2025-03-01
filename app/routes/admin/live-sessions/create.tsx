import { createSession } from "~/utils/chat.server";
import type { Route } from "./+types/create";
import { Form, href, redirect } from "react-router";


export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const description = formData.get("description");
    const name = formData.get("name");
    const link = formData.get("link");

    try {
        await createSession({
            name: name as string,
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
            description: description as string,
            link: link as string
        });

        return redirect(href("/admin/live-sessions"));

    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return { error: error.message };
        }
        return {};
    }
}


export default function CreateSession({ }: Route.ComponentProps) {


    return (
        <main>
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Crea una Sessión</h1>
            <Form action="/admin/live-sessions/create" method="post" >
                <div className="card gap-4 w-fit p-4 mx-auto bg-base-200 border border-base-300">
                    <label className="floating-label">
                        <span>Nombre</span>
                        <input type="text" placeholder="Nombre" name="name" className="input input-md" />
                    </label>

                    <label className="input">
                        <span className="label">Comienzo</span>
                        <input type="datetime-local" name="startDate" required />
                    </label>
                    <label className="input">
                        <span className="label">Finaliza</span>
                        <input type="datetime-local" name="endDate" required />
                    </label>
                    <label className="floating-label">
                        <span>Link</span>
                        <input type="text" placeholder="Link" name="link" className="input input-md" required />
                    </label>
                    <label htmlFor="description">Descripción</label>
                    <textarea name="description" id="description" className="textarea" required />
                    <button type="submit" className="btn btn-primary">Crear Sessión</button>
                </div>
            </Form>
        </main>
    )
}
