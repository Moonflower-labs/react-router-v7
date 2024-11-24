import { Form, redirect, useNavigate, useOutletContext } from "react-router";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { PaymentIntent, SetupIntent, StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { useCallback, useState } from "react";
import { ContextType } from "./layout";
import type { Route } from "./+types/subscribe";
import { requireUserId } from "~/utils/session.server";
import { getUserSubscription } from "~/models/subscription.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const userSubscription = await getUserSubscription(userId);
  if (userSubscription?.status === "active") {
    return redirect("/profile/plan/update");
  }
}

type ConfirmResponse = {
  paymentIntent?: PaymentIntent;
  setupIntent?: SetupIntent;
  error?: StripeError;
};

export default function Subscribe() {
  const { planName } = useOutletContext() as ContextType;

  return (
    <div className="pb-3">
      <h1 className="text-center text-3xl text-primary font-semibold pt-3 my-6">
        Confirma tu suscripción a <span>{planName}</span>
      </h1>
      <SubscriptionForm />
    </div>
  );
}

function SubscriptionForm() {
  const { amount, priceId } = useOutletContext() as ContextType;
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

    if (!stripe || !elements) {
      return;
    }
    // Handle loading state
    setLoading(true);
    // Trigger client-side validation
    const { error: submitError } = await elements.submit();
    if (submitError) return handleError(submitError);

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        body: JSON.stringify({ priceId })
      });
      const { type, clientSecret, error, subscriptionId } = await response.json();
      if (error) return handleError(error);

      if (!clientSecret) return;
      const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;

      const res = (await confirmIntent({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`
        },
        redirect: "if_required"
      })) as ConfirmResponse;
      if (res.error) return handleError(res.error);

      const { paymentIntent, setupIntent } = res;
      const result = type === "setup" ? setupIntent : paymentIntent;
      // Handle successful payment confirmation
      console.log("Payment successful!");

      const params = new URLSearchParams();
      params.set("clientSecret", result?.client_secret as string);
      params.set("paymentIntentId", result?.id as string);
      params.set("subscriptionId", subscriptionId);

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
    <Form onSubmit={handleSubmit} className="mx-auto rounded-lg border border-primary/40 shadow-lg p-10 min-w-[400px] w-[32vw] text-center">
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
