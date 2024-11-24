import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import type { PaymentIntent } from "@stripe/stripe-js";
import { retrieveSubscription } from "~/integrations/stripe";
import { retrievePaymentIntent } from "~/integrations/stripe/payment.server";
import type { Route } from "./+types/success";

export interface Subscription {
  current_period_start: number;
  current_period_end: number;
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const subscriptionId = url.searchParams.get("subscriptionId");
  const invoiceUrl = url.searchParams.get("invoiceUrl");
  if (subscriptionId) {
    const subscription = (await retrieveSubscription(subscriptionId)) as Subscription;
    return { subscription };
  }
  // const paymentIntentClentSecret = url.searchParams.get("clientSecret");
  const paymentIntentId = url.searchParams.get("paymentIntentId");
  if (paymentIntentId) {
    const paymentIntent = (await retrievePaymentIntent(paymentIntentId)) as PaymentIntent;
    return { paymentIntent, invoiceUrl };
  }
  return null;
}

export default function Success({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subscription = loaderData?.subscription;
  const clientSecret = searchParams.get("clientSecret");
  const [message, setMessage] = useState("");
  const paymentIntent = loaderData?.paymentIntent;

  // TODO: fetch data to display, invoice link etc.
  // console.log(subscription)

  useEffect(() => {
    if (paymentIntent) {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Pago realizado con éxito!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    }
  }, [clientSecret, paymentIntent]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center">
      <div className="text-3xl text-primary">Success</div>
      {message && <div className="text-xl">{message}</div>}
      {subscription && (
        <div>
          <p>
            Periodo de facturación actual del <span className="font-bold"> {new Date(subscription?.current_period_start * 1000).toLocaleDateString()}</span> al{" "}
            <span className="font-bold"> {new Date(subscription?.current_period_end * 1000).toLocaleDateString()}</span>
          </p>
        </div>
      )}
      <>
        {loaderData?.invoiceUrl &&
          <a className="link-primary underline" href={loaderData.invoiceUrl} target="_blank" rel="noreferrer">
            Ver/Descargar factura
          </a>}
      </>
    </div>
  );
}
