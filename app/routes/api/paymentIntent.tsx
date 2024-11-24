import { getCustomerId, stripe } from "~/integrations/stripe";
import { handlePaymentAndInvoice } from "~/integrations/stripe/payment.server";
import { getUserId } from "~/utils/session.server";
import type { Route } from "./+types/paymentIntent";
import { createOrder } from "~/models/order.server";
import { calculateTotalAmount, deleteCart, getShoppingCart } from "~/models/cart.server";
import type Stripe from "stripe";

export async function action({ request }: Route.ActionArgs) {
  const userId = (await getUserId(request)) as string;
  const cart = await getShoppingCart(userId);
  const customerId = (await getCustomerId(userId)) as string;
  let usedBalance = 0;
  if (!cart?.cartItems) {
    throw new Error("Cart must have items");
  }
  // Create a new order
  const orderId = await createOrder(userId, cart?.cartItems);
  // todo: move this to the bottom
  if (orderId) {
    await deleteCart(cart.id);
  }
  const amount = calculateTotalAmount(cart.cartItems);
  let finalAmount = amount;
  if (customerId) {
    // Check for any customer balance
    const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    const customerBalance = (customer.balance ?? 0) * -1;
    if (customerBalance > 0 && customerBalance < amount) {
      finalAmount = amount - customerBalance;
      usedBalance = customerBalance;
    } else if (customerBalance >= amount) {
      finalAmount = 0;
      usedBalance = amount;
    }
  }
  const lineItems = cart.cartItems

  const { paymentIntent, invoice } = await handlePaymentAndInvoice(customerId, finalAmount, "Compra en La Flor Blanca", lineItems, orderId);
  if (!paymentIntent) {
    throw new Response("An error has ocurred", { status: 400 });
  }

  return Response.json({ clientSecret: paymentIntent.client_secret, amount: paymentIntent.amount, usedBalance, customerId, invoice });
}
