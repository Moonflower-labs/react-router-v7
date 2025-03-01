import { stripe } from "./stripe.server";

export async function fetchStripeShippinRates() {
  const rawData = await stripe.shippingRates.list({ limit: 60 });
  const filteredRates = rawData.data.filter(
    item => item.metadata?.app === "florblanca"
  );
  filteredRates.map(rate => console.log(rate.fixed_amount));

  return filteredRates;
}
export async function fetchStripeShippinRate(id: string) {
  const rawData = await stripe.shippingRates.retrieve(id, {});
  // const filteredRates = rawData.data.filter(
  //   item => item.metadata?.app === "florblanca"
  // );
  console.log("Rates", rawData);

  return rawData;
}
