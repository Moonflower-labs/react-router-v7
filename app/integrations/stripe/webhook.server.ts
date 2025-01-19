import type Stripe from "stripe";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { deductBalanceUsed, stripe } from "~/integrations/stripe";
import {
  createSubscriptionPlan,
  getSubscriptionPlan
} from "~/models/plan.server";
import {
  getUserByCustomerId,
  getUserByEmail,
  updateUserCustomerId
} from "~/models/user.server";

export async function getStripeEvent(request: Request) {
  invariant(
    process.env.WEBHOOK_SIGNING_SECRET,
    "Please set the WEBHOOK_SIGNING_SECRET env variable"
  );
  try {
    const signature = request.headers.get("Stripe-Signature");
    if (!signature) {
      return null;
    }
    const payload = await request.text();

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.WEBHOOK_SIGNING_SECRET
    );

    return event;
  } catch (error) {
    return null;
  }
}

export async function createWebhookEndpoint(
  url: string | null,
  endpoint: string,
  description: string
) {
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
    url: !url
      ? `https://laflorblanca.vercel.app/${endpoint}`
      : `${url}/${endpoint}`,
    description
  });
  return webhookEndpoint;
}

export async function editWebhookEndpoint(id: string) {
  const webhookEndpoint = await stripe.webhookEndpoints.update(id, {
    enabled_events: ["*"]
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
  const email = customer.email as string;
  const user = await getUserByEmail(email);

  if (!user) {
    console.error(`No user found with email: ${email}`);
    return; // or handle this case as needed
  }
  // Update the user with the customer ID
  const updateResponse = await updateUserCustomerId(user.id, customer.id);

  if (updateResponse) {
    console.info(`Customer ID ${customer.id} added to user ${user.id}.`);
  } else {
    console.error(
      `Failed to update user ${user.id} with customer ID ${customer.id}.`
    );
  }
}

export async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const plan = await stripe.products.retrieve(
    subscription.items.data[0].plan.product as string
  );
  // Check if plan exists in db or create it
  const existingPlan = await getSubscriptionPlan(plan.id);
  if (!existingPlan) {
    console.info(`Creating new PLAN ${plan.name}`);
    await createSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      priceId: subscription.items.data[0].price.id
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
  const plan = await stripe.products.retrieve(
    subscription.items.data[0].plan.product as string
  );
  // Check if plan exists in db or create it
  const existingPlan = await getSubscriptionPlan(plan.id);
  if (!existingPlan) {
    console.info(`Creating new PLAN ${plan.name}`);
    await createSubscriptionPlan({
      id: plan.id,
      name: plan.name,
      priceId: subscription.items.data[0].price.id
    });
  }
  const user = await getUserByCustomerId(String(subscription.customer));
  if (!user) {
    console.error(
      `Subscription can't be updated as no user found with customerId: ${subscription.customer}!`
    );
    return;
  }
  // Retrieve the user subscription
  const userSubscription = await prisma.subscription.findUnique({
    where: { userId: user.id }
  });

  // Handle canceled subscription
  if (subscription.cancel_at_period_end) {
    console.info(`Subscription ${subscription.id} is pending cancelation`);
    console.info(
      `Subscription will end on ${new Date(
        subscription.current_period_end * 1000
      )}`
    );
    return prisma.subscription.update({
      where: { id: userSubscription?.id },
      data: {
        cancellationDate: new Date(subscription.current_period_end * 1000)
      }
    });
  }
  console.log("SUBS STATUS: ", subscription.status);
  switch (subscription.status) {
    case "active": {
      if (!userSubscription) {
        console.info(
          `✅ Saving active subscription for user with Id ${user?.id}...`
        );
        // TODO: send email notification here
        // Create a new subsbcription
        return prisma.subscription.create({
          data: {
            id: subscription.id,
            user: { connect: { id: user.id } },
            status: subscription.status,
            plan: { connect: { id: plan.id } }
          }
        });
      }
      // Udate Plan and Status for the user Subscription
      const updatedUserSubscription = await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
          status: subscription.status,
          plan: { connect: { id: plan.id } },
          cancellationDate: null
        }
      });
      // TODO: send email notification here
      console.info("Subscription succesfully updated!");
      return updatedUserSubscription;
    }
    // Todo: handle updates to canceled, incomplete, incomplete_expired, past_due, paused, unpaid, trialing
    case "past_due": {
      if (!userSubscription) return;
      // Udate Plan and Status for the user Subscription
      const updatedUserSubscription = await prisma.subscription.update({
        where: { id: userSubscription.id },
        data: {
          status: subscription.status,
          plan: { connect: { id: plan.id } }
        }
      });

      console.info("Subscription updated to past_due !");
      // TODO: Contact user requesting payment method update!!!
      return updatedUserSubscription;
    }
    case "unpaid":
    case "incomplete_expired":
    case "canceled": {
      if (!userSubscription) return;

      await prisma.subscription.delete({
        where: { id: userSubscription.id }
      });
      console.info(
        `Subscription with status: ${subscription?.status} deleted!`
      );
      return;
    }
  }
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const user = await getUserByCustomerId(String(subscription.customer));
  if (!user) {
    console.error(
      `Subscription can't be deleted as no user found with customerId: ${subscription.customer}!`
    );
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
  const orderId = paymentIntent.metadata?.order_number;
  const usedBalance = paymentIntent.metadata?.used_balance;
  if (!orderId) return;
  try {
    // Update the order status
    const order = await prisma.order.update({
      data: { status: paymentIntent.status },
      where: { id: orderId },
      include: { orderItems: true }
    });
    console.info(`Order ${orderId} status updated to succeeded`);
    console.info("usedBalance META:", usedBalance);
    // Deduct customer balance if used
    if (usedBalance && Number(usedBalance) > 0) {
      await deductBalanceUsed(
        String(paymentIntent.customer),
        Number(usedBalance)
      );
      console.warn(
        `Deducted ${usedBalance} from customer ${paymentIntent.customer}`
      );
    }
    // TODO: send email with invoice details
  } catch (e) {
    console.log(e);
    return;
  }
}

export async function handleSetupIntentSucceeded(event: Stripe.Event) {
  const setupIntent = event.data.object as Stripe.SetupIntent;
  const customerId = setupIntent.customer as string;
  const freeSubscription = !!setupIntent.metadata?.free_subscription;
  const priceId = setupIntent.metadata?.price_id;
  const orderId = setupIntent.metadata?.order_number;
  if (setupIntent.payment_method) {
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
        return;
        // TODO: send email with invoice details plan Personalidad
      } catch (e) {
        console.log(e);
        return;
      }
    }
    if (orderId) {
      // Upadate the order status
      await prisma.order.update({
        data: { status: setupIntent.status },
        where: { id: orderId },
        include: { orderItems: true }
      });
      console.info(`Order ${orderId} status updated to succeeded`);
      const usedBalance = setupIntent.metadata?.used_balance;
      // Deduct customer balance if used
      if (usedBalance && Number(usedBalance) > 0) {
        await deductBalanceUsed(
          setupIntent.customer as string,
          Number(usedBalance)
        );
        console.warn(
          `Deducted ${usedBalance} from customer ${setupIntent.customer}`
        );
      }
      // TODO: send email with invoice and order details
      return;
    }

    // This sets the payment method as default for the SUBSCRIPTION
    const userSubscription = await stripe.subscriptions.list({
      customer: setupIntent.customer as string,
      status: "active"
    });
    await stripe.subscriptions.update(userSubscription.data[0].id, {
      default_payment_method: setupIntent.payment_method as string
    });
    console.info(
      `Default payment method attached to Subscription ${userSubscription.data[0].id}`
    );
  }
}

export async function handlePaymentAttached(event: Stripe.Event) {
  const paymentMethod = event.data.object as Stripe.PaymentMethod;
  // This sets the payment method as default for the customer
  await stripe.paymentMethods.attach(String(paymentMethod.id), {
    customer: paymentMethod.customer as string
  });
  await stripe.customers.update(String(paymentMethod.customer), {
    invoice_settings: {
      default_payment_method: paymentMethod.id
    }
  });
  console.info(
    `Default payment method attached to customer for: ${paymentMethod.customer}`
  );
}
