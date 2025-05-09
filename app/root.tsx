import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/root/Footer";
import { Header } from "./components/root/Header";
import { setGuestId } from "~/middleware/sessionMiddleware";
import { getCartItemsCount } from "./models/cart.server";
// import { ToastContainer as ToastContainerUnstyled } from "react-toastify/unstyled";// doesn't work
import { toast, ToastContainer } from "react-toastify";
import { getUserPrefs, setUserPrefs } from "./cookies/userPref.server";
import logo from "../app/components/root/logo.svg"
import { honeypot } from "./utils/honeypot.server";
import { HoneypotProvider } from "remix-utils/honeypot/react"
import { useEffect } from "react";
import { getSessionContext, sessionMiddleware } from "./middleware/sessionMiddleware";
import { authMiddleware } from "./middleware/authMiddleware";
import { getUserById } from "./models/user.server";
import { Toaster } from "./components/framer-motion/Toaster";
import "./app.css";


export const unstable_middleware = [sessionMiddleware, authMiddleware]


export const links: Route.LinksFunction = () => [
  // { rel: "manifest", href: "/manifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Edu+AU+VIC+WA+NT+Pre:wght@400..700&family=Faculty+Glyphic&family=Poppins:ital,wght@0,500;1,400&family=Roboto:wght@500&display=swap"
  },
];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const honeypotInputProps = await honeypot.getInputProps()
  const session = getSessionContext(context);
  const userId = session.get("userId");
  const toastMessage = session.get("toastMessage")
  const isAdmin = session.get("isAdmin")
  const [user, userPrefs, totalItemCount] = await Promise.all([
    getUserById(userId), getUserPrefs(request), getCartItemsCount(String(userId))
  ])
  if (!userId) {
    // Ensure there's always a userId to assocciate the cart to
    setGuestId(session);
  }
  const theme = userPrefs?.theme ?? "florBlanca";

  return { user, totalItemCount, theme, honeypotInputProps, toastMessage, isAdmin };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const theme = formData.get("theme-buttons") as string;

  return setUserPrefs(request, { theme });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useRouteLoaderData("root") ?? {} // Load the theme
  // console.log("THEEEEME", theme)

  return (
    <html lang="es" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ToastContainer
          autoClose={6000}
          customProgressBar
          closeButton={false}
          icon={false}
          className={"!shadow-none !m-0 !bg-transparent"}
          draggable
          stacked
        />
        <Header />
        {children}
        <Footer />
        <ScrollRestoration
          getKey={(location, _matches) => {
            const paths = ["/gallery", "/gallery/image/*", "/personality", "/soul", "/spirit"];
            return paths.includes(location.pathname)
              ? //  restore by pathname
              location.pathname
              : // everything else by location like the browser
              location.key;
          }} />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { toastMessage } = loaderData
  useEffect(() => {
    if (toastMessage) {
      toast[toastMessage.type as "info" | "success" | "warning" | "error"](<Toaster message={toastMessage.message} />, {
        customProgressBar: true,
        closeButton: false,
      })
    }
  }, [toastMessage])

  return (
    <HoneypotProvider {...loaderData?.honeypotInputProps}>
      {/* <ToastExample /> */}
      <Outlet />
    </HoneypotProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="text-center p-4 my-auto">
        <div className="avatar mb-4">
          <div className="w-32 rounded">
            <img src={logo} alt="logo" className="transform scale-150" />
          </div>
        </div>
        <h5 className="text-3xl mb-3">Ha ocurrido un error.</h5>
        <div className="text-2xl text-error">
          <ErrorMessage error={error} />
        </div>
        <Link to={".."} className="btn btn-sm btn-primary my-4">
          Volver a inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: unknown }) {

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400: {
        return error?.data?.message || "La página no existe!";
      }
      case 401: {
        return "No estás autorizado, por favor inicia sesión.";
      }
      case 403: {
        return (
          <>
            <div>
              No tienes permiso para acceder al plan <span className="text-accent">{error?.data.plan}</span>, suscríbete!
            </div>
            <Link to={"/#plans"} className="btn btn-primary my-4">
              Planes de suscripción
            </Link>
          </>
        );
      }
      case 404: {
        return error?.data?.message || "La página no existe!";
      }
      case 503: {
        return "Parece que nuestra API no está disponible 😳";
      }
      default: {
        return error?.statusText || error.status;
      }
    }
  }
  else if (error instanceof Error) {
    return error?.message;
  }
}
