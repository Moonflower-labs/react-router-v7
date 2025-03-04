import { Form, Link, redirect, useLocation, useNavigation } from "react-router";
import { createUserSession, getUserId } from "~/utils/session.server";
import type { Route } from "./+types/login";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils/helpers";
import React from "react";
import { mergeGuestCart } from "~/models/cart.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";
import { SpamError } from "remix-utils/honeypot/server";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId && !userId.startsWith("guest-")) {
    return redirect("/");
  }
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember");
  const redirectTo = (formData.get("redirectTo") as string) ?? "/profile";

  try {
    await honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      console.error("honeypot full!", error)
    }
    throw error
  }

  if (!validateEmail(email)) {
    return { errors: { email: "Email is invalid", password: null } }
  }

  if (typeof password !== "string" || password.length === 0) {
    return { errors: { email: null, password: "Password is required" } }
  }

  if (password.length < 8) {
    return { errors: { email: null, password: "Password is too short" } }
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return { errors: { email: "Invalid email or password", password: null } }
  }
  // Manage cart merging
  const guestId = (await getUserId(request)) as string;
  await mergeGuestCart(guestId, user?.id);
  const toastMessage = { message: "Sesión iniciada!", type: "info" };
  // create user session
  return createUserSession({
    redirectTo,
    remember: Boolean(remember === "on") ? true : false,
    request,
    userId: user.id
  });
}


export default function Login({ actionData }: Route.ComponentProps) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("redirectTo") ?? "/";
  const actionErrors = actionData;
  const navigation = useNavigation();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionErrors?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionErrors?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionErrors]);

  return (
    <>
      <div className="text-center">
        <h1 className="text-5xl text-primary font-bold">Iniciar sesión</h1>
        <p className="py-8">
          ¿ No tienes una cuenta ?{" "}
          <Link to={"/register"} className="link-primary">
            Registro
          </Link>
        </p>
      </div>
      <Form method="post" replace>
        <HoneypotInputs label="Please leave this field blank" />
        <div className="card shrink-0 w-full shadow-2xl mx-auto bg-base-200 border">
          <div className="card-body">
            <input type="hidden" name="redirectTo" value={from} />
            <label htmlFor="email" className="floating-label mb-3">
              <span>Email</span>
              <input ref={emailRef} type="email" placeholder="email" className="input input-lg input-primary" name="email" id="email" required />
            </label>
            {actionErrors?.errors?.email && <span className="text-error mb-2">{actionErrors.errors.email}</span>}
            <label htmlFor="password" className="floating-label mb-3">
              <span>Contraseña</span>
              <input ref={passwordRef} type="password" placeholder="Contraseña" className="input input-lg" name="password" id="password" />
            </label>
            {actionErrors?.errors?.password && <div className="text-error mb-2">{actionErrors.errors.password}</div>}
            <Link to={"/forgot-password"} className="link link-primary link-hover">
              Olvidaste tu contraseña?
            </Link>
            <label className="label">
              <span className="label-text">Remember me</span>
              <input type="checkbox" name="remember" className="checkbox checkbox-primary" />
            </label>
            <div className="mx-auto">
              <button type="submit" className="btn btn-primary mt-3 disabled:opacity-85" disabled={navigation.state === "submitting"}>
                {navigation.state === "submitting" ? (
                  <>
                    Iniciando sesión...
                    <span className="loading loading-md"></span>
                  </>
                ) : "Iniciar sesión"}
              </button>
            </div>
          </div>
        </div>
      </Form>
    </>
  );
}
