import { stripe } from "./stripe.server";

interface SetupIntentProps {
  customerId: string;
  metadata?: Record<string, string>;
  priceId?: string;
}
/**
 *
 * @param customerId the stripe customerId of the user
 * @param metadata an optional object
 * @param priceId string- if provided it will be attached to the metadata along with a free_subscription flag
 * @returns an object containing: clientSecret and type ("setup")
 */
export async function createSetupIntent({ customerId, metadata, priceId }: SetupIntentProps) {
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card", "link"],
    usage: "off_session",
    metadata: {
      ...metadata,
      ...(priceId ? { free_subscription: "true", priceId } : {})
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
