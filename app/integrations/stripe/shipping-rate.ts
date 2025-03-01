import { stripe } from "./stripe.server";

export async function fetchStripeShippinRates() {
  const rates = await stripe.shippingRates.list({ limit: 60, active: true });
  const filteredRates = rates.data.filter(
    item => item.metadata?.app === "florblanca"
  );

  return filteredRates;
}
export async function fetchStripeShippinRate(id: string) {
  const rate = await stripe.shippingRates.retrieve(id, {});

  return rate;
}
