import React, { useState } from "react";
import { PaymentElement, useStripe, useElements, AddressElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import type { StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Form, useNavigate, useOutletContext, useRouteLoaderData } from "react-router";
import type { ContextType } from "./layout";
import type { Route } from "./+types/payment";
import type { User } from "~/models/user.server";

export async function action({ request }: Route.ActionArgs) { }

export default function Payment() {
  return (
    <div className="pb-4">
      <h1 className="text-3xl text-center text-primary font-semibold pt-3 mb-4">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { amount, customerBalance } = (useOutletContext() as ContextType) || 0;
  const { user } = useRouteLoaderData("root") as { user: User }
  const deductions = (customerBalance / 100) * -1 > 0;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleError = (error: StripeError) => {
    setLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    // Handle loading state
    setLoading(true);
    // Trigger client-side validation
    const { error: submitError } = await elements.submit();
    if (submitError) return handleError(submitError);

    try {
      // Api call to resource route endpoint
      const response = await fetch("/api/create-payment-intent", { method: "POST" });

      const { clientSecret, amount, error, usedBalance, customerId, invoice } = await response.json();
      if (error) return handleError(error);


      console.log("AMOUNT", amount);
      if (!clientSecret) return;
      // Confirm the payment if clientSecret is available
      const { paymentIntent, error: confirmationError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,

        },
        redirect: "if_required"
      });

      // Handle potential confirmation errors
      if (confirmationError) return handleError(confirmationError);
      // Handle successful payment confirmation
      if (paymentIntent.status === "succeeded") {
        //? Call api endpoint to deduct Customer Balance
        if (usedBalance > 0) {
          console.log("calling api for usedBalance", usedBalance);
          await fetch("/api/deduct-balance", {
            method: "POST",
            headers: { "Content-Type": "applicaton/json" },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id, usedBalance, customerId })
          });
        }
        if (invoice) {
          // ? mark invoice as paid
          await fetch("/api/invoice", {
            method: "POST",
            headers: { "Content-Type": "applicaton/json" },
            body: JSON.stringify({ invoiceId: invoice.id })
          });
        }
      }

      const params = new URLSearchParams();
      params.set("clientSecret", paymentIntent.client_secret as string);
      params.set("paymentIntentId", paymentIntent.id);
      if (invoice?.hosted_invoice_url) {
        params.set("invoiceUrl", invoice?.hosted_invoice_url);
      }

      // Redirect to success page with params
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
    defaultValues: {
      billingDetails: {
        // email: user?.email,
      }
    },
  };

  return (
    <Form id="payment-form" onSubmit={handleSubmit} className="mx-auto rounded-lg border shadow-lg px-8 min-w-[400px] w-[30vw] text-center">
      <h3 className="text-primary text-lg font-semibold my-3">Email</h3>
      <LinkAuthenticationElement options={{ defaultValues: { email: user?.email || "" } }} className="my-3" />
      <h3 className="text-primary text-lg font-semibold my-3">Dirección postal</h3>
      <AddressElement options={{ mode: "shipping" }} />
      <h3 className="text-primary text-lg font-semibold my-3">Pago</h3>
      <PaymentElement options={paymentElementOptions} />
      <input type="hidden" name="amount" value={amount} />
      {deductions && <div className="mt-4 font-semibold">Crédito disponible £{(customerBalance / 100) * -1}</div>}
      <button disabled={!stripe || !elements} id="submit" className="btn btn-lg btn-primary mx-auto my-3">
        {deductions ? <span>Pagar £{(amount! + customerBalance) / 100}</span> : <span>Pagar £{amount! / 100}</span>}
        {loading && <span className="loading loading-spinner loading-md"></span>}
      </button>
      {errorMessage && <div className="text-error mb-4">{errorMessage}</div>}
    </Form>
  );
}
