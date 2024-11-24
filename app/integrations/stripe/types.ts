// Define Product and Price types
export interface Price {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  unit_amount: number;
  product: string; // Associated product ID
  metadata: {
    color?: string;
    size?: string;
    title?: string;
  };
}

export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  description?: string | null;
  images?: string[]; // Assuming images are URLs as strings
  name: string;
  // Add other fields as necessary
}

export interface ProductWithPrices extends StripeProduct {
  prices: Price[]; // Array of associated prices
}

export interface CartItem {
  productId: string;
  name: string;
  amount: number;
  quantity: number;
  priceId: string;
  image: string;
}
