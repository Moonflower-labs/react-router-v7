import { Form, Link, redirect, useLocation, useNavigation } from "react-router";
import { createUserSession, getUserId } from "~/utils/session.server";
import type { Route } from "./+types/login";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils/helpers";
import React from "react";
import { mergeGuestCart } from "~/models/cart.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId && !userId.startsWith("guest-")) {
    return redirect("/");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const remember = formData.get("remember");
  const redirectTo = (formData.get("redirectTo") as string) || "/";

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
    console.log("no user");
    return { errors: { email: "Invalid email or password", password: null } }
  }
  // Manage cart merging
  const guestId = (await getUserId(request)) as string;
  await mergeGuestCart(guestId, user?.id);

  const toastMessage = { message: "Sesión iniciada!", type: "info" };
  // create user session
  throw await createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id
  });
}


export default function Login({ actionData }: Route.ComponentProps) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "/";
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
        <div className="card shrink-0 w-full shadow-2xl mx-auto">
          <div className="card-body">
            <input type="hidden" name="redirectTo" value={from} />
            <div className="form-control mb-3">
              <input ref={emailRef} type="email" placeholder="email" className="floating-label-input peer" name="email" id="email" required />
              <label htmlFor="email" className="floating-label">
                Email
              </label>
            </div>
            {actionErrors?.errors?.email && <span className="text-error">{actionErrors.errors.email}</span>}

            <div className="form-control mb-3">
              <input ref={passwordRef} type="password" placeholder="Contraseña" className="floating-label-input peer" name="password" id="password" />
              <label htmlFor="password" className="floating-label">
                Contraseña
              </label>
              <div className="label">
                <Link to={"/forgot-password"} className="label-text-alt link link-hover">
                  Olvidaste tu contraseña?
                </Link>
              </div>
              {actionErrors?.errors?.password && <div className="text-error mb-3">{actionErrors.errors.password}</div>}

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Remember me</span>
                  <input type="checkbox" name="remember" className="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
            <div className="form-control mt-6">
              <button type="submit" className="btn btn-primary disabled:opacity-85" disabled={navigation.state === "submitting"}>
                {navigation.state === "idle"
                  ? "Iniciar sesión"
                  : navigation.state === "submitting" && (
                    <>
                      Iniciando sesión...
                      <span className="loading loading-md"></span>
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
