import { Form } from "react-router";
import type { Route } from "./+types/send";
import { sendEmail } from "~/integrations/mailer/mailer.server";
import { CustomAlert } from "~/components/shared/info";

export async function loader({ request, params }: Route.LoaderArgs) {
    const url = new URL(request.url)
    const email = decodeURIComponent(url.searchParams.get("email") as string)
    const orderId = decodeURIComponent(url.searchParams.get("orderId") as string)

    return { email, orderId }
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const to = formData.get("to") as string
    const subject = "La Flor"
    const text = "Este es el mensaje"
    const html = ""


    const email = await sendEmail(to, subject, text, html)
    return email
}


export default function Email({ loaderData }: Route.ComponentProps) {
    const { email, orderId } = loaderData || {};

    return (
        <div className="p-8 text-center">
            <CustomAlert level="warning" className="max-w-md">
                <p>Esto solo es para test, de momento.</p>
                <p>En el futuro podrás enviar un email directamente relacionado con un pedido específico.</p>
            </CustomAlert>
            <h1 className="text-2xl mb-4">Email</h1>

            <div className="py-4">
                <p className="text-lg">Eviar a {email}</p>
                <p className="text-">Sobre el pedido {orderId}</p>
            </div>
            <Form method="POST" className="max-w-xs mx-auto text-center">
                <input type="text" name="to" className="input input-lg mb-4" placeholder="example@hotmail.com" />
                <button type="submit" className="btn btn-primary">Send a test email</button>
            </Form>
        </div>
    )
}