import React, { useState } from "react";
import { PaymentElement, useStripe, useElements, AddressElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import type { PaymentIntent, SetupIntent, StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Form, useNavigate, useOutletContext, useRouteLoaderData } from "react-router";
import type { ContextType } from "./layout";
import type { Route } from "./+types/payment";
import type { User } from "~/models/user.server";


export default function Payment({ }: Route.ComponentProps) {
  return (
    <div className="pb-4">
      <h1 className="text-3xl text-center text-primary font-semibold pt-3 mb-4">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}

type ConfirmResponse = {
  paymentIntent?: PaymentIntent;
  setupIntent?: SetupIntent;
  error?: StripeError;
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { amount = 0, customerBalance, cartId, type } = (useOutletContext() as ContextType);
  const { user } = useRouteLoaderData("root") as { user: User }
  const deductions = (customerBalance / 100) > 0;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleError = (error: StripeError) => {
    setLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
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
      params.set("cartId", cartId!);

      // Redirect to success page with parameters
      return navigate(`/payments/success?${params}`);
      // if (type === "setup") {
      //   const { error, setupIntent } = await stripe.confirmSetup({
      //     elements,
      //     confirmParams: {
      //       return_url: `${window.location.origin}/payments/success`,
      //     },
      //     redirect: "if_required"
      //   });

      //   if (error) {
      //     return handleError(error)
      //   }

      //   const params = new URLSearchParams();
      //   params.set("clientSecret", setupIntent.client_secret as string);
      //   params.set("setupIntentId", setupIntent.id);
      //   params.set("cartId", cartId!);
      //   // Redirect to success page with params
      //   return navigate(`/payments/success?${params}`);
      // } else {
      //   const { error, paymentIntent } = await stripe.confirmPayment({
      //     elements,
      //     confirmParams: {
      //       return_url: `${window.location.origin}/payments/success`,
      //     },
      //     redirect: "if_required"
      //   });

      //   if (error) {
      //     return handleError(error)
      //   }

      //   const params = new URLSearchParams();
      //   params.set("clientSecret", paymentIntent.client_secret as string);
      //   params.set("paymentIntentId", paymentIntent.id);
      //   params.set("cartId", cartId!);
      //   // Redirect to success page with params
      //   return navigate(`/payments/success?${params}`);
      // }

    } catch (error) {
      handleError(error as StripeError);
    } finally {
      setLoading(false);
    }
  };


  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    business: { name: "La Flor Blanca" },
    defaultValues: {
      billingDetails: {
        // email: user?.email,
      }
    },

  };

  return (
    <Form id="payment-form" onSubmit={handleSubmit} className="mx-auto rounded-lg border shadow-lg px-8 min-w-[400px] w-[30vw] text-center">
      <h3 className="text-primary text-lg font-semibold my-3">Email</h3>
      <LinkAuthenticationElement
        options={{ defaultValues: { email: user?.email || "" } }}
        className="my-3" />
      <h3 className="text-primary text-lg font-semibold my-3">Dirección postal</h3>
      <AddressElement options={{ mode: "shipping" }} />
      <h3 className="text-primary text-lg font-semibold my-3">Pago</h3>
      <PaymentElement options={paymentElementOptions} />
      <input type="hidden" name="amount" value={amount} />
      {deductions && <div className="mt-4 font-semibold">Crédito disponible £{(customerBalance / 100)}</div>}
      <button disabled={!stripe || !elements} id="submit" className="btn btn-lg btn-primary mx-auto my-3">
        {deductions ? <span>Pagar £{amount < customerBalance ? 0 : (amount! - customerBalance) / 100}</span> : <span>Pagar £{amount! / 100}</span>}
        {loading && <span className="loading loading-spinner loading-md"></span>}
      </button>
      {errorMessage && <div className="text-error mb-4">{errorMessage}</div>}
    </Form>
  );
}
