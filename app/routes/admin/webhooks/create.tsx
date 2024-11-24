import { Form } from 'react-router'
import ActionError from '~/components/framer-motion/ActionError'
import { Route } from './+types/create';
import { createWebhookEndpoint } from '~/integrations/stripe';


interface Errors {
    endpoint?: string;
    description?: string;
}
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const desciption = formData.get("desciption") as string;
    const endpoint = formData.get("endpoint") as string;
    const url = formData.get("url") as string;

    let errors: Errors = {};
    if (!endpoint) {
        errors.endpoint = "Debes añadir el endpoint";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    try {
        const webhook = await createWebhookEndpoint(url, endpoint, desciption);
        console.log(webhook?.secret)
        return { success: true, secret: webhook?.secret }
    } catch (error) {
        console.log(error);
        return { success: false };
    }
}

export default function CreateEndpoint({ actionData }: Route.ComponentProps) {
    const errors = actionData?.errors;



    return (
        <div>
            <div className="min-h-screen text-center w-full">
                <h2 className="text-2xl text-primary my-5">Crea un Webhook Endpoint</h2>
                {actionData?.success && <div className='text-2xl font-semibold'>{actionData?.secret}</div>}
                <Form method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
                    <input type="text" name={"desciption"} className="input input-bordered input-primary w-full mb-4" placeholder="Descripción" />
                    <input type="text" name={"url"} className="input input-bordered input-primary w-full mb-4" placeholder="Full url" />
                    <input type="text" name={"endpoint"} className="input input-bordered input-primary w-full mb-4" placeholder="Endpoint" />
                    {errors?.endpoint && <ActionError actionData={{ error: errors.endpoint }} />}
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="reset" className="btn btn-primary btn-outline btn-sm">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
                            Crear
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
