import { Elements } from "@stripe/react-stripe-js";
import { Outlet, redirect, useOutletContext } from "react-router";
import type { Appearance, PaymentIntent, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Route } from "./+types/layout";
import { createCustomerSession, createSubscription, getCustomerBalance, getSubscriptionData } from "~/integrations/stripe";
import { getUser, getUserId } from "~/utils/session.server";
import { calculateTotalAmount, getShoppingCart } from "~/models/cart.server";
import { useEffect, useState } from "react";
import { createPaymentIntent } from "~/integrations/stripe/payment.server";
import { createOrder } from "~/models/order.server";
import { createFreeSubscriptionSetupIntent, createSetupIntent } from "~/integrations/stripe/setup.server";

loadStripe.setLoadParameters({ advancedFraudSignals: false });
const stripePromise = loadStripe("pk_test_51LIRtEAEZk4zaxmw2ngsEkzDCYygcLkU5uL4m2ba01aQ6zXkWFXboTVdNH71GBZzvHNmiRU13qtQyjjCvTzVizlX00yXeplNgV");

export async function loader({ request }: Route.LoaderArgs) {
  const [user, userId] = await Promise.all([
    getUser(request),
    getUserId(request)
  ])
  const url = new URL(request.url);
  const planName = url.searchParams.get("plan");
  const mode = planName && url.pathname.includes("subscribe") ? "subscription" : url.pathname.includes("setup") ? "setup" : "payment"
  const customerSessionSecret = user?.customerId && !planName ? await createCustomerSession(user?.customerId) : undefined;
  let [customerBalance, usedBalance] = [0, 0];
  const customerId = user?.customerId;

  if (mode === "payment") {
    // Setup a payment intent flow
    const cart = await getShoppingCart(userId as string);
    if (!cart) {
      throw redirect("/cart");
    }
    const amount = calculateTotalAmount(cart.cartItems);
    let finalAmount = amount
    if (customerId) {
      customerBalance = await getCustomerBalance(customerId);
    }
    if (customerBalance > 0) {
      if (customerBalance < amount) {
        finalAmount = amount - customerBalance;
        usedBalance = customerBalance;
      } else if (customerBalance >= amount) {
        finalAmount = 0;
        usedBalance = amount;
      }
    }

    const orderId = await createOrder(String(userId), cart?.cartItems);
    // Create payment intent only if amount is greater than 0
    if (finalAmount <= 0 && customerId) {
      const type = "setup"
      const { clientSecret } = await createSetupIntent({ customerId, metadata: { order_number: orderId, used_balance: String(usedBalance) } })
      return { clientSecret, type, customerSessionSecret, amount, customerBalance, mode, cartId: cart.id }
    }
    // Create a PaymentIntent
    const paymentIntent = await createPaymentIntent({ customerId, amount: finalAmount, orderId, usedBalance }) as PaymentIntent;
    return { clientSecret: paymentIntent.client_secret, customerSessionSecret, amount, customerBalance, mode, cartId: cart.id };
  }
  else if (mode === "subscription" && planName) {
    // Subscription payment flow will have a plan name
    const { amount, priceId, img } = getSubscriptionData(planName);
    if (!customerId) {
      return null
    }
    if (amount <= 0) {
      // Create a SetupIntent
      const { clientSecret, type } = await createFreeSubscriptionSetupIntent({ priceId, customerId })

      return {
        clientSecret, amount, planName, customerSessionSecret, priceId, img, type
      };
    }
    // Create a Subscription
    const { subscriptionId, clientSecret, type } = await createSubscription({ priceId, customerId })

    return {
      clientSecret, subscriptionId, amount, planName, customerSessionSecret, priceId, img, type
    };
  } else if (mode === "setup" && customerId) {
    const { clientSecret, type } = await createSetupIntent({ customerId, metadata: undefined })
    return { clientSecret, type }
  }
}



export type ContextType = { amount: number | undefined; planName?: string; priceId?: string; customerBalance: number, cartId: string | undefined, mode: string | undefined, img?: string, type?: string };

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
    clientSecret: loaderData?.clientSecret as string,
    customerSessionClientSecret: customerSessionClientSecret as string,
    appearance,
    loader: "auto",
  };


  return (
    <div className="min-h-screen">
      {stripe && loaderData?.clientSecret && (
        <Elements stripe={stripe} options={options}>
          <Outlet
            context={
              {
                amount: loaderData?.amount,
                planName: loaderData?.planName,
                priceId: loaderData?.priceId,
                cartId: loaderData?.cartId,
                customerBalance: loaderData?.customerBalance ?? 0,
                mode: loaderData?.mode,
                img: loaderData?.img,
                type: loaderData?.type
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
