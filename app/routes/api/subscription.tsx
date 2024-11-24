import { createSubscription, getCustomerId } from "~/integrations/stripe";
import { getUserId } from "~/utils/session.server";
import type { Route } from "./+types/subscription";
import { data } from "react-router";

export async function action({ request }: Route.ActionArgs) {
  const jsonData = await request.json();
  const priceId = jsonData.priceId;
  const userId = await getUserId(request);
  if (!userId) {
    throw data({ message: "No user ID found" }, { status: 400 });
  }
  const customerId = await getCustomerId(userId);
  console.log("Customer ID: ", customerId);
  console.log("priceId ID: ", priceId);
  if (!customerId) {
    return Response.json({ error: "No customer id" }, { status: 400 });
  }
  const { type, clientSecret, error, subscriptionId } = await createSubscription({ priceId, customerId });

  if (error) {
    throw Response.json({ error: error.message || "An error occurred" }, { status: 400 });
  }
  return Response.json({ type, clientSecret, subscriptionId }, { status: 200 });
}
