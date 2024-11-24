import Stripe from "stripe";
import { stripe } from "~/integrations/stripe";
import { getUserById } from "~/models/user.server";

export async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({ email, name });
  return customer;
}

export async function deleteCustomer(customerId: string) {
  const deleted = await stripe.customers.del(customerId);
  return deleted;
}

export async function createCustomerSession(customerId: string) {
  try {
    const customerSession = await stripe.customerSessions.create({
      customer: customerId,
      components: {
        // pricing_table: {
        //   enabled: true,
        // },
        payment_element: {
          enabled: true,
          features: {
            payment_method_redisplay: "enabled",
            payment_method_save: "enabled",
            payment_method_save_usage: "on_session"
            // payment_method_remove: 'enabled',
          }
        }
      }
    });

    return customerSession.client_secret;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCustomerId(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user || !user.customerId) return null;

    const customerId = user.customerId;
    return customerId;
  } catch (error) {
    return null;
  }
}

export async function deductBalanceUsed(customerId: string, amountUsed: number) {
  // Fetch the current balance
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
  const currentBalance = customer.balance ?? 0;
  const avaliableCredit = Math.abs(currentBalance);
  if (avaliableCredit >= amountUsed) {
    // Deduct the balance manually
    await stripe.customers.update(customerId, {
      balance: currentBalance + amountUsed
    });
  } else {
    // Handle any edge case if balance is insufficient
    throw new Error("Insufficient balance to apply.");
  }
}

export async function getCustomerBalance(customerId: string) {
  // Fetch the current balance
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
  return customer.balance ?? 0;
}
