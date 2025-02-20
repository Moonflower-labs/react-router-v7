import React, { useState } from "react";
import { PaymentElement, useStripe, useElements, AddressElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import type { StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Form, useNavigate, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/payment";
import type { User } from "~/models/user.server";
import InfoAlert from "~/components/shared/info";


export default function Payment({ }: Route.ComponentProps) {
    return (
        <div className="pb-4">
            <h1 className="text-3xl text-center text-primary font-semibold pt-3 mb-4">Actualiza tu método de pago</h1>
            <InfoAlert level="Info">El método de pago será guardado Stripe para pagos futuros de tu suscripción.</InfoAlert>
            <SetupForm />
        </div>
    );
}

function SetupForm() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { user } = useRouteLoaderData("root") as { user: User }
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

            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payments/success`,
                },
                redirect: "if_required"
            });

            if (error) {
                return handleError(error)
            }

            const params = new URLSearchParams();
            params.set("clientSecret", setupIntent.client_secret as string);
            params.set("setupIntentId", setupIntent.id);

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
    };

    return (
        <Form id="payment-form" onSubmit={handleSubmit} className="mx-auto rounded-lg border border-base-300 bg-base-100 shadow-lg px-8 min-w-[400px] w-[30vw] text-center">
            <h3 className="text-primary text-lg font-semibold my-3">Email</h3>
            <LinkAuthenticationElement
                options={{ defaultValues: { email: user?.email || "" } }}
                className="my-3" />
            <h3 className="text-primary text-lg font-semibold my-3">Dirección postal</h3>
            <AddressElement options={{ mode: "shipping" }} />
            <h3 className="text-primary text-lg font-semibold my-3">Pago</h3>
            <PaymentElement options={paymentElementOptions} />
            <button disabled={!stripe || !elements} id="submit" className="btn btn-lg btn-primary mx-auto my-3">
                Confirmar {loading && <span className="loading loading-spinner loading-md"></span>}
            </button>
            {errorMessage && <div className="text-error mb-4">{errorMessage}</div>}
        </Form>
    );
}
