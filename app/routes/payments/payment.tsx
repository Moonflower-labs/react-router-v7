import React, { useState } from "react";
import { PaymentElement, useStripe, useElements, AddressElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import type { PaymentIntent, SetupIntent, StripeAddressElementOptions, StripeError, StripeLinkAuthenticationElementChangeEvent, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Form, useNavigate, useRouteLoaderData } from "react-router";
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
  const { amount = 0, customerBalance, usedBalance, shippingRateAmount, discount, cartId, type, orderId } = useRouteLoaderData("stripe") || {};
  const user = useRouteLoaderData("root")?.user as User;
  const deductions = (customerBalance / 100) > 0;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState<string>("");

  const handleError = (error: StripeError) => {
    setLoading(false);
    setErrorMessage(error.message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {

      if (!user?.email && guestEmail) {
        // Update order and PaymentIntent metadata with guest email
        await fetch("/api/update-guest-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, guestEmail }),
        });
      }

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
      params.set("cartId", cartId);
      params.set("orderId", orderId);

      // Redirect to success page with parameters
      return navigate(`/payments/success?${params}`);

    } catch (error) {
      handleError(error as StripeError);
    } finally {
      setLoading(false);
    }
  };
  // Retrieve email from LinkAuthenticationElement
  const handleGuestEmail = (e: StripeLinkAuthenticationElementChangeEvent) => {
    if (user) return;
    setGuestEmail(e.value.email)
  }


  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    business: { name: "La Flor Blanca" },
    defaultValues: {
      billingDetails: {
        // email: user?.email,
      }
    },
  };
  const addressElementOptions: StripeAddressElementOptions = {
    mode: "shipping",
    defaultValues: {
      name: user?.username,
      ...(user?.shippingAddress && {
        address: {
          line1: user?.shippingAddress[0]?.line1,
          line2: user?.shippingAddress[0]?.line2,
          city: user?.shippingAddress[0]?.city,
          state: user?.shippingAddress[0]?.state,
          postal_code: user?.shippingAddress[0]?.postalCode,
          country: user?.shippingAddress[0]?.country
        }
      })
    }
  }

  return (
    <Form id="payment-form" onSubmit={handleSubmit} className="mx-auto rounded-xl border border-base-300 bg-base-100 shadow-lg p-6 min-w-[400px] w-[30vw] text-center">
      <LinkAuthenticationElement
        options={{ defaultValues: { email: user?.email || guestEmail } }}
        onChange={handleGuestEmail}
        className="my-3" />
      {shippingRateAmount > 0 &&
        <>
          <h3 className="text-primary text-lg font-semibold my-3">Dirección postal</h3>
          <AddressElement options={addressElementOptions} />
        </>
      }
      <h3 className="text-primary text-lg font-semibold my-3">Pago</h3>
      <PaymentElement options={paymentElementOptions} />
      <input type="hidden" name="amount" value={amount} />
      {deductions && <div className="mt-4 font-semibold">Crédito disponible £{(customerBalance / 100)}</div>}
      {deductions && <div className="font-semibold">Crédito utilizado £{(usedBalance / 100)}</div>}
      {discount > 0 && <div className="font-bold text-success my-2">Descuento applicado {discount}%</div>}
      {shippingRateAmount > 0 && <div className="my-3 font-semibold">Envío £{(shippingRateAmount / 100)}</div>}
      <button disabled={!stripe || !elements} id="submit" className="btn btn-lg btn-primary mx-auto my-3">
        <span>Pagar £{amount / 100}</span>
        {loading && <span className="loading loading-spinner loading-md"></span>}
      </button>
      {errorMessage && <div className="text-error mb-4">{errorMessage}</div>}
    </Form>
  );
}
