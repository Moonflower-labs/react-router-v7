import { stripe } from "./stripe.server";

interface PreviewProps {
  customerId: string;
  subscriptionId: string;
  itemId: string;
  newPriceId: string;
}

export async function createPreviewInvoice({ customerId, subscriptionId, itemId, newPriceId }: PreviewProps) {
  const preview = await stripe.invoices.createPreview({
    customer: customerId,
    subscription: subscriptionId,
    subscription_details: {
      items: [
        {
          id: itemId,
          price: newPriceId
        }
      ],
      proration_behavior: "always_invoice",
      proration_date: Math.floor(Date.now() / 1000)
    }
  });

  return preview;
}

export async function listInvoices(customerId: string) {
  return stripe.invoices.list({ customer: customerId });
}
