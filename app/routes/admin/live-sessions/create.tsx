import { createSession } from "~/models/chat.server/session";
import type { Route } from "./+types/create";
import { createRoom } from "~/models/chat.server/room";
import { Form } from "react-router";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const description = formData.get("description");
    const name = formData.get("name");

    try {
        const session = await createSession({
            name: name as string,
            startDate: new Date(startDate as string),
            endDate: new Date(endDate as string),
            description: description as string
        });
        if (session.id) {
            const room = await createRoom({ name: session.name, sessionId: session.id });
            return { success: true, session, room };
        }

    } catch (error) {
        console.error(error);
    }

    return {};
}


export default function CreateSession({ actionData }: Route.ComponentProps) {
    return (
        <main>
            {actionData && (
                <div>{JSON.stringify(actionData)}</div>
            )}
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Crea una Sessión</h1>
            <Form action="/admin/live-sessions/create" method="post" >
                <div className="card gap-4 w-fit p-4 mx-auto bg-base-200 border border-base-300">
                    <label className="floating-label">
                        <span>Nombre</span>
                        <input type="text" placeholder="Nombre" className="input input-md" />
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
                    <label htmlFor="description">Descripción</label>
                    <textarea name="description" id="description" className="textarea" required />
                    <button type="submit" className="btn btn-primary">Crear Sessión</button>
                </div>
            </Form>
        </main>
    )
}
