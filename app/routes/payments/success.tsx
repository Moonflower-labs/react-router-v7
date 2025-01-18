import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import type { PaymentIntent, SetupIntent } from "@stripe/stripe-js";
import { getSubscriptionData } from "~/integrations/stripe";
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
  const success = url.searchParams.get("success");
  const mode = plan ? "subscription" : paymentIntentId ? "payment" : "setup"
  // Clear the cart
  if (cartId) {
    await deleteCart(cartId);
  }
  if (plan) {
    const planData = getSubscriptionData(plan)
    return { planData, mode };
  }

  if (paymentIntentId) {
    const paymentIntent = (await retrievePaymentIntent(paymentIntentId)) as PaymentIntent;
    return { paymentIntent, mode };
  }
  if (setupIntentId) {
    const paymentIntent = (await retrieveSetupIntent(setupIntentId)) as SetupIntent;
    return { paymentIntent, mode };
  }

  return null;
}

export default function Success({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planData = loaderData?.planData;
  const clientSecret = searchParams.get("clientSecret");
  const mode = loaderData?.mode
  const [message, setMessage] = useState("");
  const paymentOrSetupIntent = loaderData?.paymentIntent;

  useEffect(() => {
    if (paymentOrSetupIntent) {
      switch (paymentOrSetupIntent?.status) {
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
          setMessage("Something went wrong.");
          break;
      }
    }
  }, [clientSecret, paymentOrSetupIntent]);

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
      ) :
        <p className="p-10">Gracias por tu compra!. Estamos procesando el pedido y pronto estará contigo.</p>}
    </div>
  );
}
