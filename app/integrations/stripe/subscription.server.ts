import { stripe } from "./stripe.server";
import personalitImg from "../../icons/plan-personality.svg";
import soulImg from "../../icons/plan-soul.svg";
import spiritImg from "../../icons/plan-spirit.svg";
import type Stripe from "stripe";
import { prisma } from "~/db.server";

export interface SubscriptionPlan {
  name: "Personalidad" | "Alma" | "Espíritu";
  priceId: string;
  amount: number;
  mode: string;
  img: string;
}
export const PLANS: SubscriptionPlan[] = [
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

export function getSubscriptionData(name: SubscriptionPlan["name"]) {
  const data = PLANS.find(plan => plan.name === name);
  if (!data) {
    throw new Error("Plan not found");
  }
  const { mode, amount, priceId, img } = data;

  return { name, mode, amount, priceId, img };
}

// To switch to dynamic dat from stripe ?
export async function getSubscriptionPlanByName(planName: string) {
  // Step 1: Search for the product by name
  const products = await stripe.products.search({
    query: `name:'${planName}' AND active:'true'`,
    limit: 1 // Get only one product
  });

  if (products.data.length === 0) {
    console.error(`No subscription plan found with name: ${planName}`);
    return;
  }

  const product = products.data[0];
  // Step 2: Get the associated subscription prices for that product
  const prices = await stripe.prices.list({
    active: true,
    product: product.id, // Filter prices by product ID
    recurring: {} // Get only subscription plans
  });

  const data = {
    name: product.name,
    priceId: prices.data[0].id,
    amount: prices.data[0].unit_amount,
    mode: "subscription",
    img: product.images[0]
  };

  return data;
}

export async function createSubscription({
  priceId,
  customerId,
  metadata
}: {
  priceId: string;
  customerId: string;
  metadata: Record<string, string> | undefined;
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
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
      metadata: {
        ...metadata
      }
    });
    // ? This code block will only execute when creating a Free subscription
    if (subscription?.pending_setup_intent && typeof subscription.pending_setup_intent === "object") {
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
        message: e instanceof Error ? e?.message : "Error creating a subscription"
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

// this function would  handles the user plan update directly without relying in the webhook
export async function updateStripeAndUserSubscription(subscriptionId: string, priceId: string) {
  const subscription = await retrieveSubscription(String(subscriptionId));
  if (subscription.status !== "active") {
    //! Allow for inactive subscription scenario by creating a new one and confirm it
    const customerId = subscription.customer as string;
    return await createSubscription({
      priceId,
      customerId,
      metadata: undefined
    });
  }
  const customer = (await stripe.customers.retrieve(String(subscription.customer))) as Stripe.Customer;
  // Attach the customer payment method and update plan in Stripe
  const updatedSubscription = await stripe.subscriptions.update(String(subscriptionId), {
    items: [
      {
        id: subscription.items.data[0].id,
        price: String(priceId)
      }
    ],
    proration_behavior: "always_invoice",
    proration_date: Math.floor(Date.now() / 1000),
    expand: ["latest_invoice.payment_intent"],
    default_payment_method: customer.invoice_settings.default_payment_method as string,
    cancel_at_period_end: false,
    metadata: {
      updated: "true" // Flag to identify this update in webhook handler
    }
  });

  // Udate Plan and Status for the user Subscription
  const updatedUserSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: subscription.status,
      plan: { connect: { id: updatedSubscription.items.data[0].plan.product as string } },
      cancellationDate: null
    }
  });
  return updatedUserSubscription;
}

export async function cancelStripeSubscription(subscriptionId: string) {
  // return stripe.subscriptions.cancel(subscriptionId);
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}
