import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/group-send";
import { useState } from "react";
import { ImBin } from "react-icons/im";
import { renderCustomEmail } from "~/integrations/mailer/html-templates/custom-email";
import { getUsersByPlan } from "~/models/user.server";
import type { SubscriptionPlan } from "~/integrations/stripe/subscription.server";
import { sendCustomEmail } from "~/integrations/mailer/utils.server";
import { CustomAlert } from "~/components/shared/info";


export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "preview") {
        const subject = formData.get("subject") as string;
        const text = formData.get("text") as string;
        const plan = formData.get("plan") as string;
        // Get multiple link names and URLs
        const linkNames = formData.getAll("linkName") as string[];
        const linkUrls = formData.getAll("linkUrl") as string[];

        // Pair them into objects
        const links = linkNames.map((name, i) => ({
            name,
            url: linkUrls[i] || "#",
        }));

        // Fetch users based on subscription plan
        const users = await getUsersByPlan(plan as SubscriptionPlan["name"]);
        if (!users.length) {
            return { error: "No users found for this plan." };
        }
        // Render email preview with links
        const previewHtml = await renderCustomEmail({ username: "user", text, subject, links });

        return { previewHtml, recipients: users, subject, text, links };
    }

    const emailData = JSON.parse(formData.get("emailData") as string);
    let emails;
    try {
        // Send email to users
        emails = await Promise.all(emailData.recipients.map((user: { email: string, username: string }) => sendCustomEmail(user.email, user.username, emailData.subject, emailData.text, emailData.links)));
    } catch (error) {
        console.error(error);
        return { error: "Something went wrong" };

    }
    return { success: "Email sent successfully!", count: emails.length };
};



export default function EmailForm({ actionData }: Route.ComponentProps) {
    const { recipients, previewHtml, subject, text, links, success, count } = actionData || {};
    const [linkFields, setLinkFields] = useState([{ id: Date.now() }]);
    const navigation = useNavigation();

    function addLinkField() {
        setLinkFields([...linkFields, { id: Date.now() }]);
    }

    function removeLinkField(id: number) {
        setLinkFields(linkFields.filter((field) => field.id !== id));
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl text-center mb-4">Email</h1>
            <p className="text-center mb-6 px-4">Envía un email en masa a los usuarios de un deterninado plan.</p>
            <Form method="post" className="max-w-md mx-auto flex flex-col gap-3">
                <label className="input input-lg w-full">
                    <span className="label">Asunto</span>
                    <input type="text" name="subject" required />
                </label>
                <label className="textarea textarea-lg w-full">
                    <span className="label">Mensaje</span>
                    <textarea name="text" className="w-full" required rows={10} />
                </label>

                <label className="select select-lg w-full">
                    <span className="label">Plan de subscripción</span>
                    <select name="plan" required>
                        <option value="Personalidad">Personalidad</option>
                        <option value="Alma">Alma</option>
                        <option value="Espíritu">Espíritu</option>
                    </select>
                </label>

                <h3>Links:</h3>
                {linkFields.map((field) => (
                    <div key={field.id} className="flex flex-col md:flex-row gap-2">
                        <label className="input input-lg w-full">
                            <span className="label">nombre</span>
                            <input type="text" name="linkName" placeholder="Ver Sesión" required />
                        </label>
                        <div>
                            <label className="input input-lg validator w-full">
                                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></g></svg>
                                <input type="url" name="linkUrl" required placeholder="https://" defaultValue="https://" pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$" title="Must be valid URL" />
                                <button type="button" className="btn btn-circle shadow btn-sm btn-ghost" onClick={() => removeLinkField(field.id)}><ImBin className="text-error" size={24} /></button>
                            </label>
                            <p className="validator-hint">Must be valid URL</p>
                        </div>
                    </div>
                ))}
                <button type="button" className="btn btn-sm btn-success" onClick={addLinkField}>Add Link</button>

                <button type="submit" name="intent" value={"preview"} disabled={navigation.state === "submitting"} className="btn btn-sm btn-info">Generar Preview</button>
                {navigation.state === "submitting" && <CustomAlert level="loading">Generando preview...</CustomAlert>}
            </Form>
            {success && <CustomAlert level="success">Emails enviados {count}</CustomAlert>}
            {previewHtml && (
                <div className="py-8 text-center">
                    <h2 className="font-bold text-2xl">Email Preview</h2>
                    <div className="text-start" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    <h3>Recipients ({recipients?.length}):</h3>
                    <ul className="mb-4">
                        {recipients?.map((user, i) => (
                            <li key={i}>{user.email} {user.username}</li>
                        ))}
                    </ul>
                    <Form method="post">
                        <input type="hidden" name="emailData" value={JSON.stringify({ recipients, subject, text, links })} />
                        <button type="submit" name="intent" value={"send"} className="btn btn-sm btn-primary" disabled={navigation.state === "submitting"}>{navigation.state === "submitting" ? "Enviando" : "Confirmar & Enviar"}</button>
                    </Form>
                </div>
            )}
        </div>

    );
}