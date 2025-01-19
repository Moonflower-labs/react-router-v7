import { Form } from 'react-router'
import ActionError from '~/components/framer-motion/ActionError'
import type { Route } from './+types/edit';
import { editWebhookEndpoint, stripe } from '~/integrations/stripe';

export async function loader({ params }: Route.LoaderArgs) {
    const weebhookEndpoint = await stripe.webhookEndpoints.retrieve(params.id)
    return { weebhookEndpoint }

}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const endpointId = params.id;

    let errors: any = {};

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    try {
        const webhook = await editWebhookEndpoint(endpointId);
        console.log(webhook?.secret)
        return { success: true, secret: webhook?.secret }
    } catch (error) {
        console.log(error);
        return { success: false };
    }
}

export default function EditEndpoint({ actionData, loaderData }: Route.ComponentProps) {
    const errors = actionData?.errors;
    const endpoint = loaderData?.weebhookEndpoint

    return (
        <div>
            <div className="min-h-screen text-center w-full">
                <h2 className="text-2xl text-primary my-5">Edita el Webhook Endpoint</h2>
                {actionData?.success && <div className='text-2xl font-semibold'>{actionData?.success}</div>}
                <Form method="post" className="w-full md:w-1/2 mx-auto pb-4 flex flex-col">
                    <input type="text" name={"desciption"} className="input input-bordered input-primary w-full mb-4" placeholder="Descripción" value={endpoint.description as string} />
                    <input type="text" name={"url"} className="input input-bordered input-primary w-full mb-4" placeholder="Full url" value={endpoint.url} />
                    <input type="text" name={"endpoint"} className="input input-bordered input-primary w-full mb-4" placeholder="Endpoint" value={endpoint.url} />
                    {errors?.endpoint && <ActionError actionData={{ error: errors.endpoint }} />}
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="reset" className="btn btn-primary btn-outline btn-sm">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm" name="published" value={"true"}>
                            Editar
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
