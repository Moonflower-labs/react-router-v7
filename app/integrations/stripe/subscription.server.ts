import { stripe } from "./stripe.server";
import personalitImg from "../../icons/plan-personality.svg";
import soulImg from "../../icons/plan-soul.svg";
import spiritImg from "../../icons/plan-spirit.svg";
import type Stripe from "stripe";

export const PLANS = [
  {
    name: "Personalidad",
    priceId: "price_1Ng3CfAEZk4zaxmwMXEF9bfR",
    amount: 0,
    mode: "setup",
    img: personalitImg
  },
  {
    name: "Alma",
    priceId: "price_1Ng3GzAEZk4zaxmwyZRkXBiW",
    amount: 995,
    mode: "subscription",
    img: soulImg
  },
  {
    name: "Espíritu",
    priceId: "price_1Ng3KKAEZk4zaxmwLuapT9kg",
    amount: 1495,
    mode: "subscription",
    img: spiritImg
  }
];

export function getSubscriptionData(name: string) {
  const data = PLANS.find(plan => plan.name === name);
  if (!data) {
    throw new Error("Plan not found");
  }
  const { mode, amount, priceId, img } = data;

  return { name, mode, amount, priceId, img };
}

export async function createSubscription({
  priceId,
  customerId
}: {
  priceId: string;
  customerId: string;
}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId
        }
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"]
    });
    // ? This code block will only execute when creating a Free subscription
    if (
      subscription?.pending_setup_intent &&
      typeof subscription.pending_setup_intent === "object"
    ) {
      return {
        type: "setup",
        clientSecret: subscription.pending_setup_intent.client_secret,
        subscriptionId: subscription.id
      };
    }

    return {
      type: "payment",
      clientSecret:
        subscription.latest_invoice &&
        typeof subscription.latest_invoice !== "string" &&
        subscription.latest_invoice.payment_intent &&
        typeof subscription.latest_invoice.payment_intent !== "string"
          ? subscription.latest_invoice?.payment_intent.client_secret
          : null,
      subscriptionId: subscription.id
    };
  } catch (e) {
    return {
      error: {
        message:
          e instanceof Error ? e?.message : "Error creating a subscription"
      }
    };
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice.payment_intent"]
  });
  return subscription as Stripe.Subscription;
}

export async function updateStripeSubscription(
  subscriptionId: string,
  priceId: string
) {
  const subscription = await retrieveSubscription(String(subscriptionId));
  if (subscription.status !== "active") {
    // Todo: Allow for inactive subscription scenario by creating a new one and confirm it
    const customerId = subscription.customer as string;
    return await createSubscription({ priceId, customerId });
  }
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string
  )) as Stripe.Customer;
  // TODO: review this code block potencially redundant
  // Attach the payment method
  await stripe.subscriptions.update(String(subscriptionId), {
    expand: ["latest_invoice.payment_intent"],
    default_payment_method: customer.invoice_settings
      .default_payment_method as string
  });
  const updatedSubscription = await stripe.subscriptions.update(
    String(subscriptionId),
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: String(priceId)
        }
      ],
      proration_behavior: "always_invoice",
      proration_date: Math.floor(Date.now() / 1000),
      expand: ["latest_invoice.payment_intent"],
      default_payment_method: customer.invoice_settings
        .default_payment_method as string,
      cancel_at_period_end: false
    }
  );
  return updatedSubscription;
}

export async function cancelStripeSubscription(subscriptionId: string) {
  // return stripe.subscriptions.cancel(subscriptionId);
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}
