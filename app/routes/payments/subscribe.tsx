import { Form, href, redirect, useNavigate, useRouteLoaderData } from "react-router";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { PaymentIntent, SetupIntent, StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { useCallback, useState } from "react";
import type { Route } from "./+types/subscribe";
import { getUserSubscription } from "~/models/subscription.server";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = getSessionContext(context).get("userId");
  const userSubscription = await getUserSubscription(userId);
  if (userSubscription?.status === "active") {
    return redirect(href("/profile/subscription/update"));
  }
}

type ConfirmResponse = {
  paymentIntent?: PaymentIntent;
  setupIntent?: SetupIntent;
  error?: StripeError;
};

export default function Subscribe() {
  const { amount, priceId, planName, img, type, isMissedPayment } = useRouteLoaderData("stripe");

  return (
    <main className="pb-3 text-center">
      {isMissedPayment ? (
        <h1 className="text-center text-3xl text-primary font-semibold pt-3 my-6">
          Confirme el pago para reanudar su suscripción a <span>{planName}</span>
        </h1>
      ) : (
        <h1 className="text-center text-3xl text-primary font-semibold pt-3 my-6">
          Confirma tu suscripción a <span>{planName}</span>
        </h1>
      )}
      <div className="avatar mb-4">
        <div className="w-14 rounded">
          <img src={img} alt="logo" className="transform scale-110" />
        </div>
      </div>
      <SubscriptionForm amount={amount} priceId={priceId} planName={planName} type={type} />
    </main>
  );
}

interface SubscriptionFormProps {
  amount: number,
  priceId: string,
  planName: string,
  type: string
}

function SubscriptionForm({ amount, priceId, planName, type }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleError = useCallback((error: StripeError) => {
    setLoading(false);
    setErrorMessage(error.message);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    // Handle loading state
    setLoading(true);

    try {
      const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;
      const { paymentIntent, setupIntent, error } = (await confirmIntent({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`
        },
        redirect: "if_required"
      })) as ConfirmResponse;
      if (error) return handleError(error);

      const result = type === "setup" ? setupIntent : paymentIntent;
      // Handle successful payment confirmation
      const params = new URLSearchParams();
      params.set("clientSecret", result?.client_secret as string);
      type === "setup" ? params.set("setupIntentId", result?.id as string) : params.set("paymentIntentId", result?.id as string);;
      params.set("plan", planName as string);

      // Redirect to success page with parameters
      return navigate(`/payments/success?${params}`);
    } catch (error) {
      handleError(error as StripeError);
    } finally {
      setLoading(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    business: { name: "La Flor Blanca" },
    fields: {}
  };

  return (
    <Form onSubmit={handleSubmit} className="mx-auto rounded-lg border border-base-300 bg-base-100 shadow-lg p-10 min-w-[400px] w-[32vw] text-center">
      <PaymentElement options={paymentElementOptions} />
      <input type="hidden" name="priceId" value={priceId} />
      <button disabled={!stripe || !elements} className="btn btn-primary my-3">
        Suscribirme por
        <span>£{amount ? amount / 100 : "0"}</span>
        {loading && <span className="loading loading-spinner loading-md"></span>}
      </button>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </Form>
  );
}
