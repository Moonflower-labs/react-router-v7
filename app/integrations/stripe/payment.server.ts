import type Stripe from "stripe";
import { stripe } from "./stripe.server";
import type { CartItem } from "~/models/cart.server";

export async function createPaymentIntent({
  customerId,
  amount,
  orderId,
  usedBalance
}: {
  customerId: string | null | undefined;
  amount: number;
  orderId: string;
  usedBalance?: number;
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
      order_number: orderId
    }
  };
  if (customerId) {
    intentParams.customer = customerId;
  }
  if (usedBalance) {
    intentParams.metadata = {
      ...intentParams.metadata,
      used_balance: usedBalance
    };
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return paymentIntent;
  } catch (error) {
    return error;
  }
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
