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
    payment_method_types: ["card", "link"],
    usage: "off_session",
    metadata: {
      ...metadata
    }
  });
  return {
    clientSecret: setupIntent.client_secret,
    type: "setup"
  };
}

export async function createFreeSubscriptionSetupIntent({
  customerId,
  priceId,
  metadata
}: {
  priceId: string;
  customerId: string;
  metadata: Record<string, string> | undefined;
}) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card", "link"],
    usage: "off_session",
    metadata: {
      ...metadata,
      free_subscription: "true",
      priceId
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
