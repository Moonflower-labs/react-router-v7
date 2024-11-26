import { Form, useNavigation } from "react-router"
import { getUserByEmail } from "~/models/user.server";
import type { Route } from "./+types/forgot-password";
import { generateResetUrl, generateToken, validateEmail } from "~/utils/helpers";
import { prisma } from "~/db.server";
import { sendResetPasswordEmail } from "~/integrations/mailer/auth.server";

export async function action({ request }: Route.LoaderArgs) {
    const formData = await request.formData();
    const email = formData.get("email");
    if (!validateEmail(email)) {
        return { success: false, error: "Email is invalid" }
    }
    const user = await getUserByEmail(email)
    if (!user) {
        return { success: false, error: "Email not found" }
    }
    // Generate token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 3600000)
    // Save token
    await prisma.resetToken.create({
        data: {
            userId: user.id,
            token,
            expiresAt
        }
    })
    const resetUrl = generateResetUrl(token);

    try {
        // Send the reset email
        await sendResetPasswordEmail(email, resetUrl)

        return { success: true, message: "Reset email sent!" };

    } catch (error) {
        console.error(error);
        return { success: false, error: error };
    }

}

export default function Component({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation();

    return (
        <>
            <div className="text-center px-8">
                <h1 className="text-4xl font-bold text-primary mb-4">
                    Resetea tu contraseña
                </h1>

                <p className="py-8">
                    Introduce tu dirección de email y recibirás un link para cambiar tu
                    contraseña.
                </p>
            </div>

            <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                <Form method="post" className="card-body">
                    {actionData?.success && <p className="mb-3 rounded p-2 bg-success/40">Enlace enviado! Comprueba tu email.<span> No lo encuentras? Comprueba Spam</span></p>}
                    <div className="form-control">
                        <input
                            type="email"
                            placeholder="email"
                            className="floating-label-input peer"
                            name="email"
                            id="email"
                            required
                        />
                        <label htmlFor="email" className="floating-label">
                            Email
                        </label>
                    </div>
                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="btn btn-primary"
                        >
                            {navigation.state === "submitting" ? "Enviando" : "Resetear contraseña"}
                        </button>
                    </div>
                </Form>
            </div>
        </>
    );
}
