import { prisma } from "~/db.server";
import { getPrice, getProduct } from "./product.server";
import type { CartItem as Item, Price, Product } from "@prisma/client";

export interface CartItem extends Item {
  product: Product;
  price: Price;
}
export async function getShoppingCart(userId: string) {
  return prisma.cart.findFirst({
    where: { id: userId },
    include: {
      cartItems: {
        include: {
          product: true,
          price: true
        },
        orderBy: { id: "asc" }
      }
    }
  });
}

export async function getCartItemsCount(userId: string): Promise<number> {
  const result = await prisma.cartItem.aggregate({
    where: { cartId: userId },
    _sum: { quantity: true }
  });

  return result._sum.quantity ?? 0;
}

export function calculateTotalAmount(cartItems: CartItem[], discount: number = 0, shippingRate: number = 0): number {
  if (!cartItems || cartItems?.length === 0) {
    return 0;
  }

  // Calculate subtotal from cart items
  const subtotal = cartItems.reduce((total, cartItem) => {
    return total + cartItem.quantity * cartItem.price.amount;
  }, 0);
  // Apply discount if it’s 5, 10, or 15
  // Calculate discount amount in cents as an integer
  const validDiscounts = [5, 10, 15];
  const discountPercentage = validDiscounts.includes(discount) ? discount : 0;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100); // Integer discount
  const discountedSubtotal = subtotal - discountAmount;

  // Add shipping rate (default to 0 if undefined)
  return discountedSubtotal + (shippingRate ?? 0);
}

export async function addShoppingCart(userId: string) {
  if (userId.startsWith("guest-")) {
    return prisma.cart.create({ data: { guest: true, id: userId } });
  }
  return prisma.cart.create({ data: { id: userId } });
}

export async function addToCart(userId: string, productId: string, priceId: string, quantity: number = 1) {
  let [cart, product, price] = await Promise.all([getShoppingCart(userId), getProduct(productId), getPrice(priceId)]);
  if (!product || !price) {
    throw new Response("Product or price not found", { status: 404 });
  }
  if (!cart) {
    const newCart = await addShoppingCart(userId);
    cart = { ...newCart, cartItems: [] };
  }
  // If the product is already in the cart, just update the quantity
  const cartItem = cart.cartItems.find(item => item.productId === productId && item.price.id === priceId);
  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    const newTotalPrice = Number(price.amount) * newQuantity;
    if (newQuantity <= 0) {
      return removeFromCart(userId, cartItem.priceId);
    }
    return prisma.cartItem.update({
      data: { quantity: newQuantity, totalPrice: newTotalPrice },
      where: { id: cartItem.id }
    });
  }
  // Otherwise, add the product to the cart
  return prisma.cartItem.create({
    data: {
      cart: { connect: { id: cart.id } },
      product: { connect: { id: product.id } },
      quantity,
      price: { connect: { id: price.id } },
      totalPrice: Number(price.amount) * quantity
    }
  });
}

export async function removeFromCart(userId: string, priceId: string) {
  const cart = await getShoppingCart(userId);

  return prisma.cartItem.deleteMany({ where: { cartId: cart?.id, priceId } });
}

//  Merge cart
export async function mergeGuestCart(guestId: string, userId: string) {
  const guestCart = await getShoppingCart(guestId);
  if (!guestCart) return;
  // Ensured the user has a cart before procceding to merge!
  const cart = (await getShoppingCart(userId)) || (await addShoppingCart(userId));
  for (const item of guestCart.cartItems) {
    await addToCart(userId, item.product.id, item.price.id, item.quantity);
  }
  //   Delete the guest cart
  await deleteCart(guestCart.id);
  return cart.id;
}

export async function deleteCart(cartId: string) {
  try {
    await prisma.cart.delete({ where: { id: cartId } });
  } catch (e) {
    return;
  }
}
