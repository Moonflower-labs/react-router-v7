import { Form } from "react-router";
import type { Route } from "./+types/send";
import { sendEmail } from "~/integrations/mailer/mailer.server";

export async function loader({ }: Route.LoaderArgs) { }
export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData()
    const to = formData.get("to") as string
    const subject = "La Flor"
    const text = "Este es el mensaje"
    const html = ""


    const email = await sendEmail(to, subject, text, html)
    console.log(email)
    return email
}


export default function Email() {
    return (
        <div>
            Email

            <Form method="POST">
                <input type="text" name="to" className="input" placeholder="Email to" />
                <button type="submit" className="btn btn-primary">Send a test email</button>
            </Form>
        </div>
    )
}
