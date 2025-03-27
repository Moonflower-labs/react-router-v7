import type Stripe from "stripe";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { type SubscriptionPlan } from "~/integrations/stripe/subscription.server";
import { createSubscriptionPlan, getSubscriptionPlan } from "~/models/plan.server";
import { getUserByCustomerId, getUserByEmail, updateUserCustomerId } from "~/models/user.server";
import { sendMissedSubscriptionPaymentEmail, sendOrderEmail, sendSubscriptionEmail } from "../mailer/utils.server";
import type { ExtendedOrder } from "~/models/order.server";
import { stripe } from "./stripe.server";
import { deductBalanceUsed } from "./customer.server";

export async function getStripeEvent(request: Request) {
  invariant(process.env.WEBHOOK_SIGNING_SECRET, "Please set the WEBHOOK_SIGNING_SECRET env variable");
  try {
    const signature = request.headers.get("Stripe-Signature");
    if (!signature) {
      return null;
    }
    const payload = await request.text();

    const event = stripe.webhooks.constructEvent(payload, signature, process.env.WEBHOOK_SIGNING_SECRET);

    return event;
  } catch (error) {
    return null;
  }
}

export async function createWebhookEndpoint(url: string | null, endpoint: string, description: string) {
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    // enabled_events: [
    //   "customer.subscription.created",
    //   "customer.subscription.deleted",
    //   "customer.subscription.updated",
    //   "customer.created",
    //   "customer.deleted",
    //   "payment_intent.created",
    //   "payment_intent.succeeded",
    //   "payment_intent.requires_action",
    //   "payment_method.attached",
    //   "invoice.created",
    //   "invoice.finalized",
    //   "invoice.finalization_failed"
    // ],
    enabled_events: ["*"],
    url: !url ? `https://laflorblanca.vercel.app/${endpoint}` : `${url}/${endpoint}`,
    description
  });
  return webhookEndpoint;
}

export async function editWebhookEndpoint(id: string, status: "enabled" | "disabled") {
  const webhookEndpoint = await stripe.webhookEndpoints.update(id, {
    enabled_events: ["*"],
    disabled: status === "enabled" ? false : true
  });

  return webhookEndpoint;
}

export async function deleteWebhookEndpoint(id: string) {
  const webhookEndpoint = await stripe.webhookEndpoints.del(id);
  return webhookEndpoint;
}

export async function listWebhookEndpoints() {
  const webhookEndpointList = await stripe.webhookEndpoints.list({
    limit: 20
  });
  return webhookEndpointList?.data;
}

export async function handleCustomerCreated(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer;
  const email = customer.email;
  const user = email ? await getUserByEmail(email) : null;

  if (!user) {
    console.error(`No user found with email: ${email}`);
    return; // or handle this case as needed
  }
  // Update the user with the customer ID
  const updateResponse = await updateUserCustomerId(user.id, customer.id);

  if (updateResponse) {
    console.info(`Customer ID ${customer.id} added to user ${user.id}.`);
  } else {
    console.error(`Failed to update user ${user.id} with customer ID ${customer.id}.`);
  }
}

export async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const plan = await stripe.products.retrieve(subscription.items.data[0].plan.product as string);
  // Check if plan exists in db or create it
  const existingPlan = await getSubscriptionPlan(plan.id);
  if (!existingPlan) {
    console.info(`Creating new PLAN ${plan.name}`);
    await createSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      priceId: subscription.items.data[0].price.id,
      amount: subscription.items.data[0].price.unit_amount as number,
      thumbnail: plan.images[0]
    });
  }
  if (subscription.status !== "active") {
    console.info(`Subscrition ${subscription.status} created in Stripe`);
    return;
  }
  const user = await getUserByCustomerId(String(subscription.customer));
  if (!user?.id) {
    console.error("No user Id. Unable to proccess event");
    return;
  }

  // Check if user has a subscription already
  const existingUserSubscription = await prisma.subscription.findUnique({
    where: { userId: user?.id }
  });
  if (existingUserSubscription) {
    if (existingUserSubscription.status !== "active") {
      console.info(`Subscription for user with Id ${user?.id} already exists!`);
      const updatedSubscription = await prisma.subscription.update({
        where: { userId: user?.id },
        data: {
          id: subscription.id,
          status: subscription.status,
          plan: { connect: { id: plan.id } }
        }
      });
      console.info(`Subscription plan for user with Id ${user?.id} updated!`);

      return updatedSubscription;
    } else if (existingUserSubscription.status === "active") {
      console.error(`CONFLICT WITH USER ${user.username} SUBSCRIPTION`);
      return;
    }
  }

  // Create a new Subscription for the user
  return await prisma.subscription.create({
    data: {
      id: subscription.id,
      user: { connect: { id: user.id } },
      status: subscription.status,
      plan: { connect: { id: plan.id } }
    }
  });
}

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes;
  const updated = subscription.metadata?.updated === "true"; // Subscription already updated in db
  // Retrieve the plan and price from stripe to compare changes
  const plan = await stripe.products.retrieve(subscription.items.data[0].plan.product as string);

  // Check if plan exists in db or create it
  const existingPlan = await getSubscriptionPlan(plan.id);
  if (!existingPlan) {
    console.info(`Creating PLAN ${plan.name} in db`);
    await createSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      priceId: subscription.items.data[0].price.id,
      amount: subscription.items.data[0].price.unit_amount as number,
      thumbnail: plan.images[0]
    });
  }

  const user = await getUserByCustomerId(String(subscription.customer));
  if (!user) {
    console.error(`Unable to update Subscription. No user with customerId: ${subscription.customer}!`);
    return;
  }

  // Retrieve the user subscription
  let userSubscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    include: { plan: true }
  });

  switch (subscription.status) {
    case "active": {
      // Handle subscriptions set to cancel
      if (subscription.cancel_at_period_end) {
        const date = new Date(subscription.current_period_end * 1000);
        console.info(`Subscription ${subscription.id} is pending cancelation on ${date}`);
        //  Update de user subscription
        await prisma.subscription.update({
          where: { id: userSubscription?.id },
          data: { cancellationDate: date }
        });
        return;
      }
      if (!userSubscription) {
        // Create a new subsbcription
        await prisma.subscription.create({
          data: {
            id: subscription.id,
            user: { connect: { id: user.id } },
            status: subscription.status,
            plan: { connect: { id: plan.id } }
          },
          include: { plan: true }
        });
        console.info(`✅ Saved new active subscription for user: ${user?.username} ${user?.id}`);
      } else if (!updated) {
        // Udate Plan and Status for the user Subscription
        const updatedUserSubscription = await prisma.subscription.update({
          where: { id: userSubscription.id },
          data: {
            status: subscription.status,
            plan: { connect: { id: plan.id } },
            cancellationDate: null
          }
        });
      }
      console.info("✅ Subscription updated!");
      // Determine update: NEW, UPGRADE, DOWNGRADE or RENEWAL
      const updateType = getSubscriptionUpdateType(previousAttributes, subscription);
      console.info("UPDATE TYPE: ", updateType);
      // Pass the update type to the email sender
      await sendSubscriptionEmail(user?.email, user?.username, plan?.name as SubscriptionPlan["name"], updateType);
      return;
    }
    case "past_due": {
      if (!userSubscription) {
        console.info("No user subscription found, unable to update to 'past_due' ");
        return;
      }
      // Udate Plan and Status for the user Subscription
      const updatedUserSubscription = await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
          status: subscription.status,
          plan: { connect: { id: plan.id } }
        }
      });

      console.warn(`Subscription updated to ${updatedUserSubscription.status} ⛔️`);

      await sendMissedSubscriptionPaymentEmail(user?.email, user?.username, plan?.name as SubscriptionPlan["name"]);
      return;
    }
    case "unpaid":
    case "incomplete_expired":
    case "canceled": {
      if (!userSubscription) return;

      await prisma.subscription.delete({
        where: { id: userSubscription.id }
      });
      console.info(`Subscription with status: ${subscription?.status} deleted!`);
      return;
    }
  }
}

/**
 *
 * This function determines the update type of a subscription.
 *
 * Compares the previous_attributes prices if present with the subscription items prices
 *
 * Compares the subscription.created (date) with the subscription.current_period_start to determine if is a new subscription
 *
 * @param previousAttributes the previous_attributes prop from the subscription event.data
 * @param subscription a Stripe Subscription object
 * @returns a string
 */
function getSubscriptionUpdateType(previousAttributes: any, subscription: Stripe.Subscription) {
  // No previous attributes or first billing cycle -> New subscription
  if (!previousAttributes || Object.keys(previousAttributes).length === 0) {
    return "new";
  }
  if (subscription.created === subscription.current_period_start) {
    return "new";
  }
  // Item price changes -> Upgrade or Downgrade
  if (previousAttributes?.items?.data) {
    const oldItem = previousAttributes.items.data[0];
    const newItem =
      subscription.items.data.find((item: { id: any }) => item.id === oldItem.id) || subscription.items.data[0];
    const oldPrice = oldItem.price.unit_amount;
    const newPrice = newItem.price.unit_amount;

    if (newPrice && oldPrice !== newPrice) {
      return newPrice > oldPrice ? "upgrade" : "downgrade";
    }
  }
  // Period changes without item changes -> Renewal
  if (
    (previousAttributes.current_period_start &&
      previousAttributes.current_period_start !== subscription.current_period_start) ||
    (previousAttributes.current_period_end && previousAttributes.current_period_end !== subscription.current_period_end)
  ) {
    return "renewal";
  }
  // Other changes (e.g., metadata) -> Metadata update
  if (Object.keys(previousAttributes).length > 0 && !previousAttributes.items) {
    // return "metadata_update"; // No needed
  }

  return "unknown"; // Fallback
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const user = await getUserByCustomerId(String(subscription.customer));
  if (!user) {
    console.error(`Subscription can't be deleted as no user found with customerId: ${subscription.customer}!`);
    return;
  }
  // Retrieve the user subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user?.id }
  });
  if (!existingSubscription) {
    console.error(`Subscription for user with Id ${user?.id} not found!`);
    return;
  }
  if (existingSubscription.status !== "active") {
    // Delete the user Subscription
    await prisma.subscription.delete({
      where: { id: existingSubscription.id }
    });
  }
  return;
}

export async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const orderId = paymentIntent.metadata?.orderId;
  const usedBalance = paymentIntent.metadata?.usedBalance;
  const guestEmail = paymentIntent.metadata?.guestEmail;
  const address = paymentIntent.shipping?.address; // Stripe's shipping details

  if (!orderId) return;
  try {
    // If no customer Id means is a GUEST ORDER
    if (!paymentIntent.customer && guestEmail) {
      // create a user null shipping address to add to order
      let guestShippingAddress;
      // Create a new shipping address if needed
      if (address) {
        guestShippingAddress = await prisma.shippingAddress.create({
          data: {
            line1: address?.line1 as string,
            line2: address?.line2,
            city: address?.city,
            state: address?.state,
            postalCode: address?.postal_code as string,
            country: address?.country as string
          }
        });
        console.info("Guest address created ✅");
      }
      if (!guestShippingAddress) console.info("NO address shipping required");
      // add email and address to order and update status
      const order = await prisma.order.update({
        data: {
          guestEmail,
          status: paymentIntent.status === "succeeded" ? "Paid" : "Pending",
          shippingAddressId: guestShippingAddress?.id
        },
        where: { id: orderId },
        include: {
          orderItems: { include: { price: true, product: true } },
          shippingRate: true
        }
      });
      console.log("Guest order updated ✅");
      // Send email with invoice details
      await sendOrderEmail(guestEmail, "Guest", order as ExtendedOrder);
      return;
    }
    // fetch the user
    const user = await getUserByCustomerId(String(paymentIntent.customer));
    if (!user) {
      console.error("no user found");
      throw new Error("no user found can't process payment intent");
    }
    const userId = user.id;
    // Collect / Update user shipping address
    // Check if the user already has a shipping address
    const existingShippingAddress = await prisma.shippingAddress.findFirst({
      where: {
        userId,
        line1: address?.line1 as string,
        line2: address?.line2,
        city: address?.city,
        state: address?.state,
        postalCode: address?.postal_code as string,
        country: address?.country as string
      }
    });
    let addressId = existingShippingAddress?.id;
    // Create a new shipping address if it doesn't exist
    if (!existingShippingAddress) {
      const newAddress = await prisma.shippingAddress.create({
        data: {
          userId, // Link to the user
          line1: address?.line1 as string,
          line2: address?.line2,
          city: address?.city,
          state: address?.state,
          postalCode: address?.postal_code as string,
          country: address?.country as string
        }
      });

      addressId = newAddress.id;
      console.info(`New Shipping address created for user: ${userId}`);
    }

    // Update the order status
    const order = await prisma.order.update({
      data: {
        status: paymentIntent.status === "succeeded" ? "Paid" : "Pending",
        shippingAddressId: addressId
      },
      where: { id: orderId },
      include: {
        orderItems: { include: { price: true, product: true } },
        shippingRate: true
      }
    });

    console.info(`✅ Order ${orderId} status updated to succeeded`);

    // Deduct customer balance if used
    if (usedBalance && Number(usedBalance) > 0) {
      await deductBalanceUsed(String(paymentIntent.customer), Number(usedBalance));
      console.warn(`Deducted ${usedBalance} from customer ${paymentIntent.customer}`);
    }

    // Send email with invoice details
    await sendOrderEmail(String(user?.email), String(user?.username), order as ExtendedOrder);
  } catch (e) {
    console.log(e);
    return;
  }
}

export async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.SetupIntent;
  const customerId = paymentIntent.customer as string;
  const priceId = paymentIntent.metadata?.priceId;
  // If has order id in meta it must be an Order!
  const orderId = paymentIntent.metadata?.orderId;

  // fetch the user
  const user = await getUserByCustomerId(customerId);

  if (!user) {
    console.error("No user found");
    throw new Error("No user found can't process setup intent");
  }
  const userId = user.id;
  if (!paymentIntent.payment_method) return;

  // todo: Notify the user about the failed payment

  console.info(`Failed payment Intent for ${orderId}`);
}

export async function handleSetupIntentSucceeded(event: Stripe.Event) {
  const setupIntent = event.data.object as Stripe.SetupIntent;
  const customerId = setupIntent.customer as string;
  const freeSubscription = !!setupIntent.metadata?.free_subscription;
  const priceId = setupIntent.metadata?.priceId;

  // fetch the user
  const user = await getUserByCustomerId(customerId);

  if (!user) {
    console.error("No user found can't process setup intent");
    return;
  }
  if (!setupIntent.payment_method) {
    console.error("No payment_method found");
    return;
  }
  if (freeSubscription && priceId) {
    try {
      // Create a free subscription with the default payment method attached
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId
          }
        ],
        default_payment_method: setupIntent.payment_method as string,
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"]
      });
      console.info(`Free subscription created for ${customerId}`);
      //  Send email with invoice details plan Personalidad
      await sendSubscriptionEmail(user?.email, user?.username, "Personalidad");
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  } else {
    // Handle a normal setup by setting the payment method as default for the SUBSCRIPTION
    const userSubscription = await stripe.subscriptions.list({
      customer: setupIntent.customer as string,
      status: "active"
    });

    await stripe.subscriptions.update(userSubscription.data[0].id, {
      default_payment_method: setupIntent.payment_method as string
    });
    console.info(`Default payment method attached to Subscription ${userSubscription.data[0].id}`);
  }
}

export async function handlePaymentAttached(event: Stripe.Event) {
  const paymentMethod = event.data.object as Stripe.PaymentMethod;
  // This sets the payment method as default for the customer
  await stripe.customers.update(String(paymentMethod.customer), {
    invoice_settings: {
      default_payment_method: paymentMethod.id
    }
  });

  console.info(`Default payment method attached to customer for: ${paymentMethod.customer}`);
}
