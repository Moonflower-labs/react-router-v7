import { data, isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/root/Footer";
import { Header } from "./components/root/Header";
import { getUserId, sessionStorage, setGuestId } from "./utils/session.server";
import { getUserById } from "./models/user.server";
import { getCartItemsCount } from "./models/cart.server";
import { ToastContainer } from "react-toastify";
import { getUserPrefs, setUserPrefs } from "./cookies/userPref.server";
import "react-toastify/dist/ReactToastify.css";
import "./app.css";
import logo from "../app/components/root/logo.svg"


export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  // await syncStripeProducts()
  const userId = await getUserId(request);
  if (!userId) {
    const session = await setGuestId(request);
    return data(null, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session)
      }
    });
  }
  const userPrefs = await getUserPrefs(request);
  const theme = userPrefs?.theme || "florBlanca";
  const user = await getUserById(userId);
  const totalItemCount = await getCartItemsCount(String(userId));

  return { user, totalItemCount, theme };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const theme = formData.get("theme-buttons") as string;

  return setUserPrefs(request, { theme });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme={"florBlanca"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ToastContainer draggable stacked />
        <Header />
        {children}
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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
