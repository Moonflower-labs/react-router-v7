import { getStripeEvent, handleCustomerCreated, handlePaymentAttachedSucceeded, handlePaymentIntentSucceeded, handleSetupIntentSucceeded, handleSubscriptionCreated, handleSubscriptionDeleted, handleSubscriptionUpdated } from "~/integrations/stripe";
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
      await handlePaymentIntentSucceeded(event);
      break;
    case "payment_method.attached":
      await handlePaymentAttachedSucceeded(event)
      break;
    case "setup_intent.succeeded":
      await handleSetupIntentSucceeded(event);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "customer.subscription.paused":
    // await handleSubscriptionPaused(event);
    case "customer.subscription.resumed":
      // await handleSubscriptionResumed(event);
      break;
    default:
      // Unexpected event type
      console.info(`Unhandled event type ${event?.type}.`);
  }
  return Response.json(null, { status: 200 });
}
