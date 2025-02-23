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


export default function CreateSession({ actionData }: Route.ComponentProps) {
    return (
        <main>
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Crea una Sessión</h1>
            <Form action="/admin/live-sessions/create" method="post" >
                <div className="card gap-4 w-fit p-4 mx-auto bg-base-200 border border-base-300">
                    <label className="floating-label">
                        <span>Nombre</span>
                        <input type="text" placeholder="Nombre" name="name" className="input input-md" />
                    </label>
                    {/* <button popoverTarget="cally-popover1" className="input input-border" id="cally1" style="anchorName:--cally1">
                        Pick a date
                    </button> */}
                    {/* <div popover id="cally-popover1" className="dropdown bg-base-100 rounded-box shadow-lg" style="positionAnchor:--cally1">
                        <calendar-date class="cally" onchange={document.getElementById('cally1').innerText = this.value}>
                            <svg aria-label="Previous" className="size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
                            <svg aria-label="Next" className="size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
                            <calendar-month></calendar-month>
                        </calendar-date>
                    </div> */}
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
