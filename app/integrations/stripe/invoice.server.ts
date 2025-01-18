import { stripe } from "./stripe.server";

interface PreviewProps {
  customerId: string;
  subscriptionId: string;
  newPriceId: string;
}

export async function createPreviewInvoice({
  customerId,
  subscriptionId,
  newPriceId
}: PreviewProps) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const preview = await stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: subscriptionId,
    subscription_details: {
      items: [
        {
          id: subscription.items.data[0].id,
          deleted: true
        },
        {
          price: newPriceId,
          deleted: false
        }
      ],
      proration_behavior: "always_invoice",
      proration_date: Math.floor(Date.now() / 1000)
    }
    // expand: ["lines.data.plan"]
  });

  return preview;
}

export async function listInvoices(customerId: string) {
  const invoiceList = await stripe.invoices.list({
    customer: customerId,
    status: "paid"
  });
  return invoiceList.data;
}
