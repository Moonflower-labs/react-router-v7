import { Elements } from "@stripe/react-stripe-js";
import { data, href, Outlet, redirect, useRouteLoaderData } from "react-router";
import type { Appearance, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";
import type { Route } from "./+types/layout";
import { createCustomerSession, createSubscription, getCustomerBalance, getSubscriptionData, retrieveSubscription, type SubscriptionPlan } from "~/integrations/stripe/index.server";
import { calculateTotalAmount, getShoppingCart } from "~/models/cart.server";
import { useEffect, useState } from "react";
import { updateOrCreatePaymentIntent } from "~/integrations/stripe/payment.server";
import { createOrder, isOrderExist, updateOrderItems, updateOrderPaymentIntent } from "~/models/order.server";
import { createFreeSubscriptionSetupIntent, createSetupIntent } from "~/integrations/stripe/setup.server";
import { getShippinRate } from "~/models/shippingRate";
import type { Stripe as _Stripe } from "stripe";
import { differenceInDays } from "date-fns"
import { getUserById, getUserDiscount } from "~/models/user.server";
import { getUserId } from "~/middleware/sessionMiddleware";


loadStripe.setLoadParameters({ advancedFraudSignals: false });
const stripePromise = loadStripe("pk_test_51LIRtEAEZk4zaxmw2ngsEkzDCYygcLkU5uL4m2ba01aQ6zXkWFXboTVdNH71GBZzvHNmiRU13qtQyjjCvTzVizlX00yXeplNgV");

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = getUserId(context);
  const user = await getUserById(userId);
  const url = new URL(request.url);
  const mode = url.pathname.includes("subscribe") ? "subscription" : url.pathname.includes("setup") ? "setup" : "payment"
  const customerSessionSecret = user?.customerId && mode === "payment" ? await createCustomerSession(user?.customerId) : null;
  // set balances to 0
  let [customerBalance, usedBalance] = [0, 0];
  // get user discount if no user will return 0 
  const discount = getUserDiscount(user?.subscription?.plan?.name as SubscriptionPlan["name"])
  const customerId = user?.customerId;

  switch (mode) {
    case "payment": {
      const shippingRateId = url.searchParams.get("shipping");
      if (!shippingRateId) {
        throw data({ message: "shippingRateId required" }, { status: 400 });
      }

      const [cart, shippingRate] = await Promise.all([
        getShoppingCart(userId as string),
        getShippinRate(shippingRateId)
      ])
      if (!cart || cart.cartItems.length === 0) {
        throw redirect(href("/cart"))
      }

      const shippingRateAmount = shippingRate?.amount;

      if (isNaN(Number(shippingRateAmount))) {
        throw data({ message: "shippingRateId required" }, { status: 400 });
      }

      const baseAmount = calculateTotalAmount(cart.cartItems, discount, shippingRateAmount);
      let finalAmount = baseAmount;


      if (customerId) {
        customerBalance = await getCustomerBalance(customerId);
        if (customerBalance > 0) {
          const amountAfterBalance = baseAmount - customerBalance;
          finalAmount = Math.max(amountAfterBalance, 50);
          usedBalance = baseAmount > customerBalance ? customerBalance : baseAmount;
        }
      }
      // Check for existing order
      const existingOrder = await isOrderExist(String(userId), cart.id)
      // Check if order is stale (e.g., no updates in the last 6 days)
      const isOrderStale = existingOrder
        ? differenceInDays(new Date(), new Date(existingOrder.updatedAt)) > 6
        : false;

      // Check if the cart items changed
      const hasCartChanged = existingOrder
        ? cart.cartItems.length !== existingOrder.orderItems.length ||
        cart?.cartItems.some(item => {
          const orderItem = existingOrder.orderItems.find(o => o.productId === item.product.id && o.priceId === item.price.id);
          return !orderItem || orderItem.quantity !== item.quantity;
        }) : false;

      // Determine order and payment intent
      let orderId = existingOrder?.id;
      let paymentIntent;

      // If order is stale or has no intent, create a new intent; otherwise, update existing
      const needsNewIntent = isOrderStale || !existingOrder?.paymentIntentId;

      if (!existingOrder) {
        // Create new order
        console.info("No existing order. Creating new order...");
        const order = await createOrder(String(userId), cart.id, cart.cartItems, shippingRateId);
        orderId = order.id

      } else {
        // Update order items if cart has changed
        console.info("existing order found", existingOrder.id);
        if (hasCartChanged) {
          console.info("Cart has changed. Updating order items...");
          await updateOrderItems(existingOrder.id, cart.cartItems);
        }
      }

      paymentIntent = await updateOrCreatePaymentIntent({
        id: needsNewIntent ? undefined : existingOrder.paymentIntentId,
        orderId: orderId as string,
        customerId,
        amount: finalAmount,
        usedBalance,
        metadata: {
        }
      });
      // Update order with new intent if it’s new or missing
      if (needsNewIntent || !existingOrder || existingOrder.paymentIntentId !== paymentIntent?.id) {
        console.info("Updating order with new payment intent id 👌");
        await updateOrderPaymentIntent(String(orderId), String(paymentIntent?.id));
      }

      return {
        clientSecret: paymentIntent?.client_secret, customerSessionSecret, amount: finalAmount, discount,
        shippingRateAmount, customerBalance, usedBalance, mode, cartId: cart.id, orderId
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
      const { amount, priceId, img } = getSubscriptionData(planName as SubscriptionPlan["name"]);

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
          subscriptionId, paymentIntentStatus: paymentIntent?.status, clientSecret: paymentIntent?.client_secret,
          isMissedPayment, amount: paymentIntent?.amount, priceId, img, planName
        };
      } else {
        if (!customerId) {
          throw data({ message: "customerId required for subscription!" }, { status: 400 })
        }
        if (amount <= 0) {
          // Create a SetupIntent for a Free subcription
          const { clientSecret, type } = await createFreeSubscriptionSetupIntent({ priceId, customerId, metadata: { plan: planName } })

          return {
            clientSecret, amount, planName, customerSessionSecret, priceId, img, type
          };
        }
        // Create a Subscription
        const { subscriptionId, clientSecret, type } = await createSubscription({ priceId, customerId, metadata: { plan: planName } })

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
  const theme = useRouteLoaderData("root")?.theme
  const customerSessionClientSecret = loaderData?.customerSessionSecret;
  const clientSecret = loaderData?.clientSecret as string;
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);
  const darkThemes = ["dracula", "night", "dim", "sunset", "coffee", "abyss", "aqua"]

  useEffect(() => {
    setStripe(stripePromise);
    return () => {
      setStripe(null);
    };
  }, []);

  const appearance: Appearance = {
    theme: theme && darkThemes.includes(theme) ? "night" : "stripe",
    labels: 'floating',
    variables: {
      colorPrimary: "#a762f1",
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
