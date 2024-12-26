import type Stripe from "stripe";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { createSubscription, stripe } from "~/integrations/stripe";
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
    enabled_events: [
      "customer.subscription.created",
      "customer.subscription.deleted",
      "customer.subscription.updated",
      "customer.created",
      "customer.deleted",
      "payment_intent.created",
      "payment_intent.succeeded",
      "payment_intent.requires_action",
      "payment_method.attached",
      "invoice.created",
      "invoice.finalized",
      "invoice.finalization_failed"
    ],
    url: !url
      ? `https://laflorblanca.vercel.app/${endpoint}`
      : `${url}/${endpoint}`,
    description
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
  const user = await getUserByCustomerId(String(subscription.customer));

  // Check if user has a subscription already
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user?.id }
  });
  if (existingSubscription) {
    console.error(`Subscription for user with Id ${user?.id} already exists!`);
    // todo: handle this scenario by updating the existing subscription
  }

  // Create a new Subscription for the user
  const newUserSubscription = await prisma.subscription.create({
    data: {
      id: subscription.id,
      user: { connect: { id: user?.id } },
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

  // Retrieve the user subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user?.id }
  });
  if (!existingSubscription) {
    console.error(
      `Subscription for user with Id ${user?.id} not found!\nUnable to update`
    );
    // As backup create the new sunsbcription. This should never be triggered
    return prisma.subscription.create({
      data: {
        id: subscription.id,
        user: { connect: { id: user?.id } },
        status: subscription.status,
        plan: { connect: { id: plan.id } }
      }
    });
  }

  // Udate Plan and Status for the user Subscription
  const updatedUserSubscription = await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: subscription.status,
      plan: { connect: { id: plan.id } }
    }
  });

  console.log("Subscription succesfully updated!");

  return updatedUserSubscription;
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const user = await getUserByCustomerId(String(subscription.customer));

  // Retrieve the user subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user?.id }
  });
  if (!existingSubscription) {
    console.error(`Subscription for user with Id ${user?.id} not found!`);
    return;
  }

  // Delete the user Subscription
  const deletedSubscription = await prisma.subscription.delete({
    where: { id: existingSubscription.id }
  });
}

export async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const orderId = paymentIntent.metadata?.orderId;
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    console.log("order: ", order);
    //todo:  // Update the order status to paid
    //  await prisma.order.update({data:{status:"Paid"},where:{id:orderId}});
  } catch (e) {
    console.error(e);
    return;
  }
}

// def handle_setup_intent_succeeded(self, event):
// """ Create a free subscription """
// setup_intent = event.data.object
// metadata = setup_intent.metadata
// customer_id = setup_intent.customer
// price_id = os.environ.get('FREE_PLAN_PRICE_ID')
// if metadata is not None:
//     if 'reason' in metadata and metadata.reason == "free plan":
//         try:
//             # Create the subscription
//             subscription = stripe.Subscription.create(
//                 customer=customer_id,
//                 items=[{'price': price_id}],
//                 trial_end='now',
//                 payment_settings={"payment_method_types": ["card"]},
//                 expand=['latest_invoice.payment_intent'],

//             )
//             logger.info(f"new free subscription created")
//             return {'subscriptionId': subscription.id}
//         except stripe.error.StripeError as e:
//             # You can handle specific Stripe errors if required
//             return {'error': str(e)}
//         except Exception as e:
//             return {'error': str(e)}
// else:
//     logger.info("No metadata found")
