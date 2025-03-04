import type Stripe from "stripe";
import { stripe } from "./stripe.server";

export async function createPaymentIntent({
  customerId,
  amount,
  orderId,
  usedBalance,
  metadata
}: {
  customerId: string | null | undefined;
  amount: number;
  orderId: string;
  usedBalance?: number;
  metadata: Record<string, string> | undefined;
}) {
  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: amount,
    currency: "gbp",
    // automatic_payment_methods: {
    //   enabled: true
    // },
    payment_method_types: [
      "card",
      "afterpay_clearpay",
      "klarna",
      "link",
      "wechat_pay"
    ],
    metadata: {
      ...metadata,
      orderId
    }
  };
  if (customerId) {
    intentParams.customer = customerId;
  }
  if (usedBalance) {
    intentParams.metadata = {
      ...intentParams.metadata,
      usedBalance
    };
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return paymentIntent;
  } catch (error) {
    throw error;
  }
}

export async function updateOrCreatePaymentIntent({
  id,
  customerId,
  amount,
  orderId,
  usedBalance,
  metadata
}: {
  id?: string | null;
  customerId?: string | null;
  amount: number;
  orderId: string;
  usedBalance?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  if (id) {
    try {
      const paymentIntent = await stripe.paymentIntents.update(id, {
        amount,
        metadata: {
          ...metadata,
          orderId
        }
      });
      console.log("INTENT UPDATED:", paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      console.error(`Failed to update PaymentIntent ${id}`);
      // Fall back to creating a new intent if update fails (e.g., invalid ID)
      console.info("Creating new PaymentIntent due to update failure...");
    }
  }

  const newIntent = await createPaymentIntent({
    customerId,
    amount,
    orderId,
    usedBalance,
    metadata
  });
  console.log("INTENT CREATED:", newIntent.id);
  return newIntent as Stripe.PaymentIntent;
}

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id);
}

// Deduct customer balance used, handling negative balance
export async function deductBalanceUsed(
  customerId: string,
  amountUsed: number
) {
  const customer = (await stripe.customers.retrieve(
    customerId
  )) as Stripe.Customer;
  const currentBalance = customer.balance ?? 0; // Handle null balance

  // Deduct from balance (Note: balance is negative when customer has credits)
  const newBalance = currentBalance + amountUsed;
  await stripe.customers.update(customerId, { balance: newBalance });
}
