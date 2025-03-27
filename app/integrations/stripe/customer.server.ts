import Stripe from "stripe";
import { getUserById } from "~/models/user.server";
import { stripe } from "./stripe.server";

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
  } catch (e) {
    return null;
  }
}

// export async function getCustomer(customerId: string) {
//   try {
//     const customer = await stripe.customers.retrieve(customerId);
//     return customer as Stripe.Customer;
//   } catch (e) {
//     return null;
//   }
// }

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
  return customer.balance !== undefined ? Math.abs(customer.balance) : 0;
}

export async function isSubscriptionDefaultPaymentMethodValid(subscriptionId: string) {
  try {
    const userSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"]
    });
    // If the subscription is active and has default_payment_method
    if (userSubscription.status === "active" && typeof userSubscription.default_payment_method === "object") {
      switch (userSubscription?.default_payment_method?.type) {
        case "card": {
          const card = userSubscription.default_payment_method.card;

          if (!card || !card.exp_year || !card.exp_month) {
            return false; // If card data missing assume expired
          }
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const isCardValid =
            card.exp_year > currentYear || (card.exp_year === currentYear && card.exp_month >= currentMonth);
          return isCardValid;
        }
        case "link":
        case "cashapp":
        case "amazon_pay":
        case "paypal": {
          return true;
        }
        case "acss_debit":
        case "sepa_debit":
        case "bacs_debit": {
          return true;
        }
        default: {
          console.warn(`Unsupported payment method type: ${userSubscription?.default_payment_method?.type}`);
          return false;
        }
      }
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function isCustomerDefaultPaymentMethodValid(customerId: string) {
  try {
    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    const defaultPaymentMethodId = customer?.invoice_settings.default_payment_method;
    if (!defaultPaymentMethodId) {
      return false;
    }
    const paymentMethod = await stripe.paymentMethods.retrieve(String(defaultPaymentMethodId));
    switch (paymentMethod.type) {
      case "card": {
        const card = paymentMethod.card;
        const isCardExpired =
          card?.exp_year! < new Date().getFullYear() ||
          (card?.exp_year! === new Date().getFullYear() && card?.exp_month! < new Date().getMonth() + 1);
        return !isCardExpired;
      }
      case "link":
      case "cashapp":
      case "amazon_pay":
      case "paypal": {
        return true;
      }
      case "acss_debit":
      case "sepa_debit":
      case "bacs_debit": {
        return true;
      }
      default: {
        console.warn(`Unsupported payment method type: ${paymentMethod.type}`);
        return false;
      }
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}
