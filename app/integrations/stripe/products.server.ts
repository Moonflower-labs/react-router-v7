import type Stripe from "stripe";
import { stripe } from "../../integrations/stripe/stripe.server";

export async function fetchStripeProducts() {
  const products = await stripe.products.search({
    query: "active:'true' AND metadata['app']:'florblanca'"
  });
  const prices = await stripe.prices.list({ limit: 100 });

  // Group the prices by product ID
  const groupedPrices = prices.data.reduce((acc, price) => {
    const productId = price.product as string;
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(price);
    return acc;
  }, {} as { [key: string]: Stripe.Price[] });

  // Combine products and their prices
  const productsWithPrices = products.data.map(product => ({
    ...product,
    prices: groupedPrices[product.id] || []
  }));

  return productsWithPrices;
}
