import { retrievePaymentIntent } from "~/integrations/stripe/payment.server";
import type { Route } from "./+types/deduct-balance";
import type Stripe from "stripe";
import { deductBalanceUsed } from "~/integrations/stripe";

export async function action({ request }: Route.ActionArgs) {
  const body = await request.json();
  const paymentIntentId = body?.paymentIntentId;
  const usedBalance = body?.usedBalance;
  const customerId = body?.customerId;

  try {
    const paymentIntent = (await retrievePaymentIntent(paymentIntentId)) as Stripe.PaymentIntent;
    if (paymentIntent.status === "succeeded" && customerId && usedBalance > 0) {
      await deductBalanceUsed(customerId, usedBalance);
      console.warn(`Deducted ${usedBalance} from customer ${customerId}`);
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Error while trying to deduct balance" });
  }
}
