import { Form, useNavigation, replace, redirect, data, } from "react-router";
import type { Route } from "./+types/reset-password"
import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { SpamError } from "remix-utils/honeypot/server";
import { honeypot } from "~/utils/honeypot.server";



export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    // take user to homepage if there's no token in the url
    if (!token) {
        throw redirect("/");
    }

    return { token };
};

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const token = formData.get("token");
    const password = formData.get("password");
    const passwordConfirmation = formData.get("confirm");

    try {
        await honeypot.check(formData)
    } catch (error) {
        if (error instanceof SpamError) {
            console.error("honeypot full!", error)
        }
        throw error
    }

    if (password !== passwordConfirmation) {
        return { error: "Passwords should match" }
    }

    if (typeof token !== "string" || typeof password !== "string") {
        throw data({ message: "Invalid input" }, { status: 400 })
    }
    try {
        // Find the token
        const resetToken = await prisma.resetToken.findUnique({ where: { token } })
        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw data({ message: "Invalid or expired token" }, { status: 400 })
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10)
        // Update user's password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: { update: { hash: hashedPassword } } }
        })
        // Delete the reset token
        await prisma.resetToken.delete({ where: { token } })

    } catch (error: unknown) {
        console.error(error);
        return { error: "Ha ocurrido un error" };
    }
    throw replace("/login");
}

export default function ResetPassword({ loaderData, actionData }: Route.ComponentProps) {

    const navigation = useNavigation();
    const token = loaderData?.token;


    return (
        <>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">
                    Confirma el cambio de contraseña
                </h1>
                <p className="py-8 w-2/3 mx-auto">Elige una contraseña nueva.</p>
            </div>

            <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <Form method="post" className="card-body">
                    <HoneypotInputs label="Please leave this field blank" />
                    <input value={token} type="hidden" id="token" name="token" required />
                    <div className="form-control mb-3">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="floating-label-input peer"
                            name="password"
                            id="password"
                            required
                        />
                        <label htmlFor="password" className="floating-label">
                            Contraseña
                        </label>
                    </div>
                    <div className="form-control mb-3">
                        <input
                            type="password"
                            placeholder="Comfirmación"
                            className="floating-label-input peer"
                            name="confirm"
                            id="confirm"
                            required
                        />
                        <label htmlFor="confirm" className="floating-label">
                            Comfirmación
                        </label>
                    </div>
                    {actionData?.error ? <em className="text-red-600">{actionData?.error}</em> : null}
                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="btn btn-primary"
                        >
                            {navigation.state === "submitting" ? "Confirmando" : "Confirmar"}
                        </button>
                    </div>
                </Form>
            </div>
        </>
    );
}
