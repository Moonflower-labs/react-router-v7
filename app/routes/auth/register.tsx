import { Form, Link, useNavigation, redirect } from "react-router";
import { createUserSession, getUserId } from "~/utils/session.server";
import type { Route } from "./+types/register";
import { createUser, getUserByEmail } from "~/models/user.server";
import { validateEmail, validateUsername } from "~/utils/helpers";
import { sendWelcomeEmail } from "~/integrations/mailer/utils.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { honeypot } from "~/utils/honeypot.server";
import { SpamError } from "remix-utils/honeypot/server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId && !userId.startsWith("guest-")) {
    return redirect("/");
  }
  return null;
}


export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  try {
    await honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      console.error("honeypot full!", error)
    }
    throw error
  }

  if (!validateUsername(username)) {
    return { errors: { email: null, password: null, username: "Nombre de usuario no puede contener espacios ni sobrepasar los 18 caracteres!" } }
  }

  if (!validateEmail(email)) {
    return { errors: { email: "Email is invalid", password: null } }
  }

  if (typeof password !== "string" || password.length === 0) {
    return { errors: { email: null, password: "El password es requerido" } }
  }

  if (password.length < 8) {
    return { errors: { email: null, password: "El password es muy corto" } }
  }

  if (password !== confirmation) {
    return { errors: { email: null, password: "Los passwords deben de coincidir" } }
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { errors: { email: "A user already exists with this email", password: null } }
  }

  try {
    const user = await createUser(email, password, username);

    await sendWelcomeEmail(user.email, user.username)

    return createUserSession({
      redirectTo,
      remember: false,
      request,
      userId: user.id
    });
  } catch (e) {
    console.log(e)
    return { errors: { username: "This username already exists", password: null } }
  }
}

export default function ResgisterPage({ actionData }: Route.ComponentProps) {
  const actionErrors = actionData;
  const navigation = useNavigation();

  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl text-primary font-bold">Registrar usuario</h1>
        <p className="py-6">
          Si ya estás registrado inicia sesión{" "}
          <Link to={"/login"} className="link-primary">
            aquí
          </Link>
        </p>
      </div>
      <Form method="post" className="w-full">
        <HoneypotInputs label="Please leave this field blank" />
        <div className="card text-center max-w-sm shadow-2xl bg-base-200 border mx-auto">
          <div className="card-body">
            <label className="floating-label mb-3" htmlFor="username">
              <span>Nombre de usuario</span>
              <input type="text" placeholder="Usuario" className="input input-md input-primary" name="username" id="username" />

            </label>
            {actionErrors?.errors?.username && <div className="text-error mb-3">{actionErrors.errors.username}</div>}
            <label className="floating-label mb-3" htmlFor="email">
              <input type="email" placeholder="Email" className="input input-md input-primary" name="email" id="email" />{" "}
              <span>Email</span>
            </label>
            {actionErrors?.errors?.email && <div className="text-error mb-3">{actionErrors.errors.email}</div>}

            <label className="floating-label mb-3" htmlFor="password">
              <input type="password" placeholder="Contraseña" className="input input-md input-primary" name="password" id="password" />
              <span>Contraseña</span>
            </label>
            {actionErrors?.errors?.password && <div className="text-error mb-3">{actionErrors.errors.password}</div>}
            <label className="floating-label mb-3" htmlFor="confirmation">
              <input type="password" placeholder="Contraseña" className="input input-md input-primary" name="confirmation" id="confirmation" />
              <span>Confirma la contraseña</span>
            </label>
            <div className="form-control mt-6">
              <button className="btn btn-primary" disabled={navigation.state === "submitting"}>
                {navigation.state === "idle"
                  ? "Registrar"
                  : navigation.state === "submitting" && (
                    <>
                      Registrando usuario...
                      <span className="loading loading-ring loading-lg"></span>
                    </>
                  )}
              </button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
