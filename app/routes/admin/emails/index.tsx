import { href, Link } from "react-router";

export default function Index() {
    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl text-primary font-bold mb-4">Emails</h1>
            <div className="flex justify-center items-center flex-col gap-1.5">
                <Link to={href("/admin/emails/send")} className="p-2 rounded border border-base-200 w-sm">Test Email</Link>
                <Link to={href("/admin/emails/group-send")} className="p-2 rounded border border-base-200 w-sm">Enviar Email a Grupo</Link>
            </div>
        </div>
    )
}
