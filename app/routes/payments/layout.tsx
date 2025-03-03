import { Elements } from "@stripe/react-stripe-js";
import { data, href, Outlet, redirect } from "react-router";
import type { Appearance, PaymentIntent, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Route } from "./+types/layout";
import { createCustomerSession, createSubscription, getCustomerBalance, getSubscriptionData, retrieveSubscription } from "~/integrations/stripe";
import { getUser, getUserId } from "~/utils/session.server";
import { calculateTotalAmount, getShoppingCart } from "~/models/cart.server";
import { useEffect, useState } from "react";
import { createPaymentIntent } from "~/integrations/stripe/payment.server";
import { createOrder } from "~/models/order.server";
import { createFreeSubscriptionSetupIntent, createSetupIntent } from "~/integrations/stripe/setup.server";
import { getShippinRate } from "~/models/shippingRate";
import type { Stripe as _Stripe } from "stripe";

loadStripe.setLoadParameters({ advancedFraudSignals: false });
const stripePromise = loadStripe("pk_test_51LIRtEAEZk4zaxmw2ngsEkzDCYygcLkU5uL4m2ba01aQ6zXkWFXboTVdNH71GBZzvHNmiRU13qtQyjjCvTzVizlX00yXeplNgV");

export async function loader({ request }: Route.LoaderArgs) {
  const [user, userId] = await Promise.all([
    getUser(request),
    getUserId(request)
  ])
  const url = new URL(request.url);
  const mode = url.pathname.includes("subscribe") ? "subscription" : url.pathname.includes("setup") ? "setup" : "payment"
  const customerSessionSecret = user?.customerId && mode === "payment" ? await createCustomerSession(user?.customerId) : null;
  let [customerBalance, usedBalance] = [0, 0];
  const customerId = user?.customerId;

  switch (mode) {
    case "payment": {
      const cart = await getShoppingCart(userId as string);
      const shippingRateId = url.searchParams.get("shipping");

      if (!shippingRateId) {
        throw data({ message: "shippingRateId required" }, { status: 400 });
      }

      const shippingRate = await getShippinRate(shippingRateId);
      const shippingRateAmount = shippingRate?.amount;

      if (isNaN(Number(shippingRateAmount))) {
        throw data({ message: "shippingRateId required" }, { status: 400 });
      }

      if (!cart) {
        throw data({ message: "No cart fount. Cartis required for payment" }, { status: 400 });
      }

      let amount = calculateTotalAmount(cart.cartItems, shippingRateAmount);
      let finalAmount = amount + 50; // Always add £0.50 

      if (customerId) {
        customerBalance = await getCustomerBalance(customerId);
      }

      if (customerBalance > 0) {
        if (customerBalance < amount) {
          // Deduct balance, ensuring at least £0.50 remains
          finalAmount = Math.max(amount - customerBalance + 50, 50);
          usedBalance = customerBalance;
        } else {
          // Balance fully covers order, but we still add $0.50
          finalAmount = 50;
          usedBalance = amount;
        }
      }
      // Create the order
      const orderId = await createOrder(String(userId), cart?.cartItems, shippingRateId);

      // Always create a PaymentIntent (SetupIntent is never needed)
      const paymentIntent = await createPaymentIntent({ customerId, amount: finalAmount, orderId, usedBalance }) as PaymentIntent;

      return {
        clientSecret: paymentIntent.client_secret, customerSessionSecret, amount: finalAmount, shippingRateAmount, customerBalance, usedBalance, mode, cartId: cart.id,
      };
    }
    case "setup": {
      if (!customerId) {
        throw data({ message: "customerId required for setup intent" }, { status: 400 })
      }
      const { clientSecret, type } = await createSetupIntent({ customerId, metadata: undefined })
      return { clientSecret, type }
    }
    case "subscription": {
      // Subscription payment flow will have a plan name
      const planName = url.searchParams.get("plan");
      const missed = url.searchParams.get("missed");
      const subscriptionId = url.searchParams.get("subscriptionId");
      const isMissedPayment = missed?.toString() === "true";

      if (!planName) throw data({ message: "Plan name required" }, { status: 400 });

      if (isMissedPayment) {
        // Collect a different payment method to complete the missed payment. 
        if (!subscriptionId) throw data({ message: "subscriptionId not found in searchParams" }, { status: 400 })
        const subscription = await retrieveSubscription(subscriptionId)
        if (typeof subscription.latest_invoice !== "object") throw data({ message: "subscription invoice not found" }, { status: 400 })
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice?.payment_intent as _Stripe.PaymentIntent;
        if (!paymentIntent) {
          throw redirect(href("/profile/subscription/update"))
        }
        return {
          subscriptionId,
          paymentIntentStatus: paymentIntent?.status,
          clientSecret: paymentIntent?.client_secret,
          isMissedPayment
        };
      } else {
        const { amount, priceId, img } = getSubscriptionData(planName);
        if (!customerId) {
          console.log("no customer id found")
          return;
        }
        if (amount <= 0) {
          // Create a SetupIntent for a Free subcription
          const { clientSecret, type } = await createFreeSubscriptionSetupIntent({ priceId, customerId, metadata: { plan: planName } })

          return {
            clientSecret, amount, planName, customerSessionSecret, priceId, img, type
          };
        }
        // Create a Subscription
        const { subscriptionId, clientSecret, type } = await createSubscription({ priceId, customerId })

        return {
          clientSecret, subscriptionId, amount, planName, customerSessionSecret, priceId, img, type
        };
      }
    }
    default:
      throw data({ error: "Invalid mode" }, { status: 400 });
  }
}



export default function StripeLayout({ loaderData }: Route.ComponentProps) {
  const customerSessionClientSecret = loaderData?.customerSessionSecret;
  const clientSecret = loaderData?.clientSecret as string;
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
    clientSecret,
    customerSessionClientSecret: customerSessionClientSecret as string,
    appearance,
    loader: "auto",
  };


  return (
    <div className="min-h-screen">
      {stripe && clientSecret && (
        <Elements stripe={stripe} options={options}>
          <Outlet />
        </Elements>
      )}
    </div>
  );
}
