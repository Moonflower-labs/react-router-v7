import { Elements } from "@stripe/react-stripe-js";
import { Outlet, redirect, useOutletContext } from "react-router";
import type { Appearance, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Route } from "./+types/layout";
import { createCustomerSession, getCustomerBalance, getCustomerId, getSubscriptionData } from "~/integrations/stripe";
import { getSession } from "~/utils/session.server";
import { calculateTotalAmount, getShoppingCart } from "~/models/cart.server";
import { getUserById } from "~/models/user.server";
import { useEffect, useState } from "react";

loadStripe.setLoadParameters({ advancedFraudSignals: false });
const stripePromise = loadStripe("pk_test_51LIRtEAEZk4zaxmw2ngsEkzDCYygcLkU5uL4m2ba01aQ6zXkWFXboTVdNH71GBZzvHNmiRU13qtQyjjCvTzVizlX00yXeplNgV");

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");
  const user = await getUserById(userId);
  const url = new URL(request.url);
  const planName = url.searchParams.get("plan");
  const customerSessionSecret = user?.customerId && !planName ? await createCustomerSession(user?.customerId) : null;
  let customerBalance = 0;
  const customerId = await getCustomerId(userId);
  // Subscription payment flow will have a plan name
  if (planName) {
    const { mode, amount, priceId } = getSubscriptionData(planName);
    console.log(mode, amount);
    return { customerSessionSecret, mode, amount, planName, priceId };
  }
  // Setup a payment intent flow
  const cart = await getShoppingCart(userId);
  if (!cart) {
    throw redirect("/cart");
  }
  const amount = calculateTotalAmount(cart.cartItems);
  if (customerId) {
    customerBalance = await getCustomerBalance(customerId);
  }
  return { customerSessionSecret, mode: "payment", amount, customerBalance };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const priceId = formData.get("priceId");
  if (!priceId) {
    throw redirect("/payments");
  }
  return getSubscriptionData(String(priceId));
}

export type ContextType = { amount: number | undefined; planName?: string; priceId?: string; customerBalance: number };

export default function StripeLayout({ loaderData }: Route.ComponentProps) {
  const customerSessionClientSecret = loaderData?.customerSessionSecret;
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    setStripe(stripePromise);
    return () => {
      setStripe(null);
    };
  }, []);

  const appearance: Appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#a92deb"
    }
  };

  const options: StripeElementsOptions = {
    mode: loaderData?.mode ? (loaderData.mode as "setup" | "subscription" | "payment") : undefined,
    amount: loaderData?.amount,
    currency: "gbp",
    customerSessionClientSecret: customerSessionClientSecret as string,
    appearance
  };

  return (
    <div className="min-h-screen">
      {stripe && (
        <Elements stripe={stripe} options={options}>
          <Outlet
            context={
              {
                amount: loaderData?.amount,
                planName: loaderData?.planName,
                priceId: loaderData?.priceId,
                customerBalance: loaderData?.customerBalance ?? 0
              } satisfies ContextType
            }
          />
        </Elements>
      )}
    </div>
  );
}

export function useAmount() {
  return useOutletContext<ContextType>();
}
