import { prisma } from "~/db.server";
import { stripe } from "~/integrations/stripe";
import personalitImg from "../../icons/plan-personality.svg";
import soulImg from "../../icons/plan-soul.svg";
import spiritImg from "../../icons/plan-spirit.svg";

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

  return { mode, amount, priceId, img };
}

export async function createSubscription({ priceId, customerId }: { priceId: string; customerId: string }) {
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
    // Check if it's a setup intent
    if (subscription.pending_setup_intent !== null) {
      return {
        type: "setup",
        clientSecret: typeof subscription.pending_setup_intent === "string" ? null : subscription.pending_setup_intent.client_secret
      };
    } else {
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
    }
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error?.message : "Error creating a subscription"
      }
    };
  }
}

export async function updateSubscription({
  priceId,
  SubItemId, // the subscription item to replace the current price with the new price.
  subscriptionId
}: {
  priceId: string;
  SubItemId: string;
  subscriptionId: string;
}) {
  try {
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: SubItemId,
          price: priceId
        }
      ]
    });

    return updatedSubscription;
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error?.message : "Error updating a subscription"
      }
    };
  }
}

export async function retrieveSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function retrieveStripeSubscription({ userId }: { userId: string }) {
  try {
    const userSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });
    if (!userSubscription) return null;
    const subscription = await stripe.subscriptions.retrieve(userSubscription.id);
    return subscription;
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error?.message : "Error updating a subscription"
      }
    };
  }
}
