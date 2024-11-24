import type Stripe from "stripe";
import { stripe } from "./stripe.server";
import { CartItem } from "~/models/cart.server";

export async function createPaymentIntent({ customerId, amount, orderId }: { customerId: string; amount: number; orderId: string }) {
  const intentParams: Stripe.PaymentIntentCreateParams = {
    amount: amount,
    currency: "gbp",
    metadata: {
      order_number: orderId
    }
  };
  if (customerId) {
    intentParams.customer = customerId;
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create(intentParams);

    return paymentIntent;
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error?.message : "Error creating a payment intent"
      }
    };
  }
}

export async function retrievePaymentIntent(id: string) {
  return stripe.paymentIntents.retrieve(id);
}

// Deduct customer balance used, handling negative balance
export async function deductBalanceUsed(customerId: string, amountUsed: number) {
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
  const currentBalance = customer.balance ?? 0; // Handle null balance

  // Deduct from balance (Note: balance is negative when customer has credits)
  const newBalance = currentBalance + amountUsed;
  await stripe.customers.update(customerId, { balance: newBalance });
}

// Main function to create a PaymentIntent and an Invoice
export async function handlePaymentAndInvoice(customerId: string | null, paymentAmount: number, description: string, lineItems: CartItem[], orderId: string) {
  try {
    if (customerId) {
      //  Create and finalize the invoice
      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: "send_invoice",
        auto_advance: false,
        days_until_due: 7,
        metadata: {
          order_number: orderId
        }
      });
      //  Create line items for the invoice
      for (const item of lineItems) {
        await stripe.invoiceItems.create({
          invoice: invoice.id,
          customer: customerId,
          amount: item.price.amount * item.quantity,
          currency: "gbp",
          description: `${item.product.name} ${item.price?.info} (x${item.quantity})`
        });
        console.warn(`${item.product.name} ${item.price?.info} (x${item.quantity})`);
      }

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      console.warn("Invoice url", finalizedInvoice.hosted_invoice_url);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalizedInvoice?.amount_due,
        currency: "gbp",
        customer: customerId ?? undefined,
        description,
        automatic_payment_methods: { enabled: true },
        metadata: {
          order_number: orderId,
          invoice_id: finalizedInvoice.id
        }
      });

      console.log("Invoice finalized and linked:", finalizedInvoice.id);

      return { paymentIntent, invoice };
    }
    //  Create only PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: "gbp",
      customer: customerId ?? undefined,
      description,
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_number: orderId
      }
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    return { paymentIntent };
  } catch (error) {
    console.error("Error in handling payment and invoice:", error);
    throw new Error("Failed to process payment and create invoice.");
  }
}
