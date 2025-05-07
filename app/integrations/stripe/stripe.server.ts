import Stripe from "stripe";
import invariant from "tiny-invariant";

let _stripe: Stripe;

function getStripeServerClient() {
  // ensure secret key is set
  invariant(process.env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY must be set");
  if (!_stripe) {
    // Reference : https://github.com/stripe/stripe-node#usage-with-typescript
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil"
    });
  }
  return _stripe;
}

export const stripe = getStripeServerClient();

// export type StripeEvent = ReturnType<Stripe["webhooks"]["constructEvent"]>;
