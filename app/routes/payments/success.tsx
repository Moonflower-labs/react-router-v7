import { useEffect, useState } from "react";
import { href, Link, useLocation, useRouteLoaderData } from "react-router";
import type { PaymentIntent, SetupIntent } from "@stripe/stripe-js";
import { getSubscriptionData, type SubscriptionPlan } from "~/integrations/stripe";
import { retrievePaymentIntent } from "~/integrations/stripe/payment.server";
import type { Route } from "./+types/success";
import { deleteCart } from "~/models/cart.server";
import { retrieveSetupIntent } from "~/integrations/stripe/setup.server";


export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const cartId = url.searchParams.get("cartId");
  const paymentIntentId = url.searchParams.get("paymentIntentId");
  const setupIntentId = url.searchParams.get("setupIntentId");
  const orderId = url.searchParams.get("orderId");
  const success = url.searchParams.get("success");
  const mode = plan ? "subscription" : paymentIntentId ? "payment" : "setup"
  // Clear the cart
  if (cartId) {
    await deleteCart(cartId);
  }

  if (plan && ["Personalidad", "Alma", "Espíritu"].includes(plan)) {
    const planData = getSubscriptionData(plan as SubscriptionPlan["name"]);
    return { planData, mode };
  }
  let intent;

  if (paymentIntentId) {
    const paymentIntent = (await retrievePaymentIntent(paymentIntentId)) as PaymentIntent;
    intent = paymentIntent
  }
  if (setupIntentId) {
    const setupIntent = (await retrieveSetupIntent(setupIntentId)) as SetupIntent;
    intent = setupIntent
  }

  return { intent, orderId, mode };
}

export default function Success({ loaderData }: Route.ComponentProps) {
  const { planData, orderId, intent, mode } = loaderData;
  const { user } = useRouteLoaderData("root")
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientSecret = searchParams.get("clientSecret");
  const [message, setMessage] = useState("");


  useEffect(() => {
    if (intent) {
      switch (intent?.status) {
        case "succeeded":
          setMessage("Pago realizado con éxito!");
          break;
        case "processing":
          setMessage("El pago se está procesando");
          break;
        case "requires_payment_method":
          setMessage("El pago no se ha podido realizar");
          break;
        default:
          setMessage("Ha ocurrido un error");
          break;
      }
    }
  }, [clientSecret, intent]);

  return (
    <div className="min-h-[80vh] flex flex-col gap-6 justify-center items-center text-center">
      {message && <div className="text-xl">{message}</div>}
      {mode === "subscription" && planData ? (
        <div>
          <h1 className="text-3xl mb-4">Bienvenido a {planData.name}!</h1>
          <div className="avatar mb-4">
            <div className="w-14 rounded">
              <img src={planData.img} alt="logo" className="transform scale-110" />
            </div>
          </div>
          <p>Visita la <Link to={"/members"} className="link link-primary">sección de miembros</Link></p>
        </div>
      ) : (
        <div className="p-10">
          <p>Gracias por tu compra!. Estamos procesando el pedido y pronto estará contigo.</p>
          <div className="mb-3">Te hemos enviado un email de confirmación</div>
          <div className="font-bold text-xl mb-4">Número de Pedido: {orderId}</div>
          {user ? (
            <p className="max-w-md mx-auto">Para ver su listado de pedidos vaya a la sección de
              <Link to={href("/profile/orders")} className="link link-primary"> pedidos</Link> en su perfil.
            </p>
          ) : (
            <p className="max-w-md mx-auto">Tome nota de su número de pedido por si acaso.
              Y considera el <Link to={href("/register")} className="link link-primary">registrarte</Link> con nosotros,
              es gratuito y podrás ver el historial de tus compras y mucho más.
            </p>
          )}
        </div>
      )
      }
    </div>
  );
}
