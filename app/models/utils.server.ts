import { prisma } from "~/db.server";
import { fetchStripeShippinRates } from "~/integrations/stripe/shipping-rate";

export async function syncStripeShippingRates() {
  try {
    const stripeRates = await fetchStripeShippinRates();

    for (const rate of stripeRates) {
      // Check for existing
      const existingRate = await prisma.shippingRate.findUnique({
        where: { id: rate.id }
      });
      // if exist update it
      if (existingRate) {
        const updatedRate = await prisma.shippingRate.update({
          where: { id: existingRate.id },
          data: {
            displayName: rate.display_name as string,
            amount: rate.fixed_amount?.amount, // £2.50 in pence
            metadata: rate.metadata
          }
        });
        console.log(updatedRate);
      } else {
        //Create a new rate
        const newRate = await prisma.shippingRate.create({
          data: {
            id: rate.id,
            displayName: rate.display_name as string,
            amount: rate.fixed_amount?.amount as number, // £2.50 in pence
            metadata: rate.metadata
          }
        });
        console.log(newRate);
      }
    }
    console.info("Shipping Rates successfully synced wiht Stripe");
  } catch (error) {
    console.error("Error while trying to sync Shipping Rates");
  }
}

// {
//   id: 'shr_1Ns5zEAEZk4zaxmwyK6CpQxn',
//   object: 'shipping_rate',
//   active: true,
//   created: 1695137836,
//   delivery_estimate: {
//     maximum: { unit: 'hour', value: 48 },
//     minimum: { unit: 'hour', value: 24 }
//   },
//   display_name: "FREE, MY PRODUCT DOESN'T NEED A DELIVERY",
//   fixed_amount: { amount: 0, currency: 'gbp' },
//   livemode: false,
//   metadata: { app: 'florblanca' },
//   tax_behavior: 'unspecified',
//   tax_code: 'txcd_92010001',
//   type: 'fixed_amount'
// }

//   metadata: { app: 'florblanca' },
// model ShippingRate {
//     id          String  @id @default(cuid())
//     displayNmae String
//     amount      Int
//     metadata    Json
//     createdAt   DateTime @default(now())

//     Order Order[]
//   }
