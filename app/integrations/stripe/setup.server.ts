import { stripe } from "./stripe.server";

export async function createSetupIntent({
  customerId,
  metadata
}: {
  customerId: string;
  metadata: Record<string, string> | undefined;
}) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card", "link", "paypal"],
    usage: "off_session",
    metadata
  });
  return {
    clientSecret: setupIntent.client_secret,
    type: "setup"
  };
}

export async function createFreeSubscriptionSetupIntent({
  customerId,
  priceId
}: {
  priceId: string;
  customerId: string;
}) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    // payment_method_types: ["card"],
    automatic_payment_methods: {
      enabled: true
    },
    usage: "off_session",
    metadata: {
      free_subscription: "true",
      price_id: priceId
    }
  });
  return {
    clientSecret: setupIntent.client_secret,
    type: "setup"
  };
}

export async function retrieveSetupIntent(id: string) {
  return stripe.setupIntents.retrieve(id);
}
