import { Form } from "react-router";
import type { Route } from "./+types/send";
import { sendEmail } from "~/integrations/mailer/mailer.server";


export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const to = formData.get("to") as string
    const subject = "La Flor"
    const text = "Este es el mensaje"
    const html = ""


    const email = await sendEmail(to, subject, text, html)
    return email
}


export default function Email() {
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl mb-4">Email</h1>
            <p className="mb-3">Esto es solo para test</p>

            <Form method="POST" className="max-w-xs mx-auto text-center">
                <input type="text" name="to" className="input input-lg mb-4" placeholder="example@hotmail.com" />
                <button type="submit" className="btn btn-primary">Send a test email</button>
            </Form>
        </div>
    )
}