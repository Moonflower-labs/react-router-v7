import { Form, Link, useNavigation, redirect } from "react-router";
import type { Route } from "./+types/register";
import { createUser, getUserByEmail } from "~/models/user.server";
import { validateEmail, validateUsername } from "~/utils/helpers";
import { sendWelcomeEmail } from "~/integrations/mailer/utils.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { honeypot } from "~/utils/honeypot.server";
import { SpamError } from "remix-utils/honeypot/server";
import { getSessionContext, getUserId } from "~/middleware/sessionMiddleware";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = getUserId(context);
  if (userId && !userId.startsWith("guest-")) {
    return redirect("/");
  }
  return null;
}


export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const session = getSessionContext(context);
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
    const allowedAdmins = process.env.ADMIN_LIST
      ? process.env.ADMIN_LIST.split(",").map((email) => email.trim())
      : [];
    const isAdmin = !!allowedAdmins?.includes(user.email)

    const toastMessage = { message: "Sesión iniciada!", type: "info" };

    // Start a user session
    session.set("userId", user.id)
    session.set("isAdmin", isAdmin)
    session.flash("toastMessage", toastMessage)

    return redirect(redirectTo)

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
        <h1 className="text-4xl text-primary font-bold">Registrar usuario</h1>
        <p className="py-6">
          Si ya estás registrado inicia sesión
          <Link to={"/login"} className="ms-2 link link-primary">
            aquí
          </Link>
        </p>
      </div>
      <Form method="post">
        <HoneypotInputs label="Please leave this field blank" />
        <div className="card text-center max-w-sm shadow-2xl bg-base-200 border mx-auto">
          <div className="card-body">
            <label className="floating-label mb-3" htmlFor="username">
              <span>Nombre de usuario</span>
              <input type="text" placeholder="Usuario" className="input input-md input-primary" name="username" id="username" />
            </label>
            {actionErrors?.errors?.username && <div className="text-error mb-3">{actionErrors.errors.username}</div>}
            <label className="floating-label mb-3" htmlFor="email">
              <input type="email" placeholder="Email" className="input input-lg input-primary" name="email" id="email" />{" "}
              <span>Email</span>
            </label>
            {actionErrors?.errors?.email && <div className="text-error mb-3">{actionErrors.errors.email}</div>}

            <label className="floating-label mb-3" htmlFor="password">
              <input type="password" placeholder="Contraseña" className="input input-lg input-primary" name="password" id="password" />
              <span>Contraseña</span>
            </label>
            {actionErrors?.errors?.password && <div className="text-error mb-3">{actionErrors.errors.password}</div>}
            <label className="floating-label mb-3" htmlFor="confirmation">
              <input type="password" placeholder="Contraseña" className="input input-lg input-primary" name="confirmation" id="confirmation" />
              <span>Confirma la contraseña</span>
            </label>
            <div className="form-control mt-6">
              <button className="btn btn-primary" disabled={navigation.state === "submitting"}>
                {navigation.state === "submitting" ? (
                  <>
                    Registrando usuario...
                    <span className="loading loading-ring loading-lg"></span>
                  </>
                ) : "Registrar"
                }
              </button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
