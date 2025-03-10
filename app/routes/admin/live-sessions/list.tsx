import { data, Form, href, Link, Outlet, useSubmit } from "react-router";
import { formatDate } from "~/utils/format";
import { ImBin } from "react-icons/im";
import { useEffect, useState } from "react";
import { toast, type Id } from "react-toastify";
import { IoMdAdd } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import type { Route } from "./+types/list";
import { deleteSession, getSessions } from "~/utils/chat.server";
import { CiEdit } from "react-icons/ci";


export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const title = url.searchParams.get("search");
    const liveSessions = await getSessions()

    // const page = Number((url.searchParams.get('page')) || 1);
    // const pageSize = Number((url.searchParams.get('pageSize')) || 3);

    return { liveSessions, q: title };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId");

    if (!sessionId) {
        throw data({ message: "No session ID provided" }, { status: 400 });
    }

    if (request.method === "DELETE") {
        await deleteSession(String(sessionId));

        return { success: true, deleted: true };
    }

    throw data({ message: "Method not allowed" }, { status: 400 });
}

export default function ListSessions({ loaderData, actionData }: Route.ComponentProps) {
    const { liveSessions } = loaderData;
    const submit = useSubmit();
    const [toastId, setToastId] = useState<Id | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (actionData?.success) {
            if (actionData?.deleted) {
                toast.success("Sesión eliminada");
            }
        }
    }, [actionData]);

    const handleSbubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const sessionId = form.sessionId.value;
        const date = form.date.value;
        setSessionId(sessionId);
        if (toastId) {
            toast.dismiss(toastId);
            setToastId(null)
        }
        const _toastId = toast.warn(
            <div>
                <span>Quieres eliminar esta sesión?</span>
                <div className="flex justify-center gap-5 mt-3">
                    <button
                        onClick={() => {
                            toast.dismiss();
                            console.log("Submitting form:", event.target);
                            submit({ sessionId, date }, { method: "DELETE" });
                        }}
                        className="btn btn-sm btn-primary">
                        Si
                    </button>
                    <button onClick={() => toast.dismiss()} className="btn btn-sm btn-primary">
                        No
                    </button>
                </div>
            </div>,
            {
                // position: "top-right",
                autoClose: false,
            }
        );
        setToastId(_toastId);
    };

    return (
        <div>
            <h1 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Sessiones en Directo</h1>
            <div className="flex justify-center md:w-1/2 mx-auto">
                <Link to={href("/admin/live-sessions/create")} className="btn btn-md btn-success m-6 w-full" viewTransition>
                    Crear Sesión  <IoMdAdd size={24} />
                </Link>
            </div>
            {liveSessions?.length ? (
                liveSessions.map((session, index) => (
                    <div
                        key={session.id}
                        className={`flex flex-col lg:flex-row justify-between items-center gap-6 p-3 border ${session.id === sessionId ? "border-warning border-2" : ""} rounded-lg shadow-md md:w-2/3 mx-auto mb-6`}>
                        <div className="flex justify-between items-center w-full">
                            <span>
                                {index + 1}. {session.name}{" "}
                            </span>
                            <span className="me-5">{formatDate(session.createdAt)}</span>
                        </div>
                        <div className="flex flex-col justify-between items-center w-full">
                            <span>
                                Fecha de comienzo {new Date(session.startDate).toLocaleString()}{" "}
                            </span>
                            <span>
                                Finaliza {new Date(session.endDate).toLocaleTimeString()}{" "}
                            </span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Link to={`${session.id}/detail`} className="btn btn-circle btn-sm btn-ghost shadow" viewTransition>
                                <FaEye size={24} />
                            </Link>
                            <Link to={href("/admin/live-sessions/edit/:sessionId", { sessionId: session.id })} className="btn btn-sm btn-circle btn-ghost shadow" viewTransition>
                                <CiEdit size={24} className="text-info" />
                            </Link>
                            <Form method="post" onSubmit={handleSbubmit}>
                                <input type="hidden" name="date" value={session.createdAt.toISOString()} />
                                <button type="submit" name="sessionId" value={session.id} className="btn btn-circle btn-sm btn-ghost shadow">
                                    <ImBin size={24} className="text-error" />
                                </button>
                            </Form>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex gap-4 justify-center items-center">
                    <span>No hay ninguna sessión que mostrar todavía.</span>
                </div>
            )}
            {/* <div className="text-center">
                <Paginator pagination={loaderData?.pagination} />
            </div> */}
            <Outlet />
        </div>
    );
}
