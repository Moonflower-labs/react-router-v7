import type { Route } from "./+types/list";
import { data, Form, Link } from "react-router";
import { deleteWebhookEndpoint, listWebhookEndpoints } from "~/integrations/stripe/webhook.server";
import { ImBin } from "react-icons/im";
import { formatDayTime } from "~/utils/format";
import { CiEdit } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";


export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const title = url.searchParams.get("search");
    const webhooks = await listWebhookEndpoints();

    return { webhooks, q: title };
}


export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const endpointId = formData.get("endpointId");

    if (!endpointId) {
        throw data({ message: "No category ID provided" }, { status: 400 });
    }
    //  Delete the post
    await deleteWebhookEndpoint(String(endpointId));

    return { success: true };
}

export default function Webhooks({ loaderData }: Route.ComponentProps) {
    const endpoints = loaderData?.webhooks
    return (
        <div>
            <h2 className="text-2xl text-primary flex justify-center items-center gap-4 my-5">Webhooks</h2>
            {endpoints?.length ? (
                endpoints.map((endpoint, index) => (
                    <div key={endpoint.id} className="flex justify-between items-center p-3 border border-primary/20 rounded-lg shadow-md mb-3 lg:w-2/3 mx-auto">
                        {endpoint.description} {formatDayTime(new Date(endpoint.created * 1000))}
                        <div className="flex gap-3 items-center">
                            <div className="inline-grid *:[grid-area:1/1]">
                                <div className={`status ${endpoint.status === "enabled" ? "status-success" : " status-error"} animate-ping`}></div>
                                <div className={`status status-${endpoint.status === "enabled" ? " status-success" : " status-error"}`}></div>
                            </div>
                            <div>{endpoint.status}</div>
                        </div>
                        <div className="flex gap-3 items-center">
                            <Link to={"create"} className="btn btn-sm btn-outline btn-success" viewTransition>
                                <IoMdAdd size={24} />
                            </Link>
                            <Link to={`edit/${endpoint.id}`} className="btn btn-sm btn-outline btn-info" viewTransition>
                                <CiEdit size={24} />
                            </Link>
                            <Form method="post">
                                <button type="submit" name="endpointId" value={endpoint.id} className="btn btn-sm btn-outline btn-error">
                                    <ImBin size={24} />
                                </button>
                            </Form>
                        </div>
                    </div>

                ))) :
                <div className="flex gap-4 justify-center items-center">
                    <span>No hay ningún endpoint.</span>
                    <Link to={"create"} className="btn btn-sm btn-outline btn-success" viewTransition>
                        <IoMdAdd size={24} />
                    </Link>
                </div>
            }
        </div>
    )
}
