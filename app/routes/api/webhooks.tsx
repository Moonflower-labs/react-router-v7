import { getStripeEvent, handleCustomerCreated, handlePaymentIntentSucceeded, handleSubscriptionCreated, handleSubscriptionDeleted, handleSubscriptionUpdated } from "~/integrations/stripe";
import type { Route } from "./+types/webhooks";
import { prisma } from "~/db.server";

export async function action({ request }: Route.ActionArgs) {
  const event = await getStripeEvent(request);
  if (!event) {
    return Response.json(null, { status: 400 });
  }

  try {
    // Use upsert instead of separate find and create
    await prisma.processedEvent.upsert({
      where: { id: event.id },
      create: { id: event.id },
      update: {} // Do nothing if it exists
    });
  } catch (error) {
    // If we still get an error, the event is being processed
    console.log(`Event ${event.id} already processed, skipping`);
    return Response.json(null, { status: 200 });
  }

  // Handle the event
  switch (event?.type) {
    case "customer.created":
      await handleCustomerCreated(event);
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      await handlePaymentIntentSucceeded(event)
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case "payment_method.attached":
      const paymentMethod = event.data.object;
      console.info(`PaymentMethod for customer ${paymentMethod.customer} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case "setup_intent.succeeded":
      const setupIntent = event.data.object;
      console.log(setupIntent);
      // handlePaymentMethodAttached(paymentMethod);
      break;
    case "customer.subscription.created":
      const subscription = event.data.object;
      console.log(subscription);
      await handleSubscriptionCreated(event);
      break;
    case "customer.subscription.updated":
      console.info("Attempting to update subscription");
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      console.log(deletedSubscription);
      await handleSubscriptionDeleted(event);
      break;
    default:
      // Unexpected event type
      console.info(`Unhandled event type ${event?.type}.`);
  }
  return Response.json(null, { status: 200 });
}
