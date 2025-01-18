import { prisma } from "~/db.server";
import { type CartItem } from "./cart.server";

export async function createOrder1(userId: string, cartItems: CartItem[]) {
  if (userId.startsWith("guest-")) {
    const guestOrder = await prisma.order.create({
      data: {
        guest: true,
        userId,
        orderItems: {
          create: cartItems.map(item => ({
            product: { connect: { id: item.product.id } },
            price: { connect: { id: item.price.id } },
            quantity: item.quantity || 1
          }))
        }
      }
    });

    return guestOrder.id;
  }
  const order = await prisma.order.create({
    data: {
      guest: userId.startsWith("guest-") ?? false,
      user: { connect: { id: userId } },
      orderItems: {
        create: cartItems.map(item => ({
          product: { connect: { id: item.product.id } },
          price: { connect: { id: item.price.id } },
          quantity: item.quantity || 1
        }))
      }
    }
  });

  return order.id;
}
export async function createOrder(userId: string, cartItems: CartItem[]) {
  const data: any = {
    guest: userId.startsWith("guest-"),
    orderItems: {
      create: cartItems.map(item => ({
        product: { connect: { id: item.product.id } },
        price: { connect: { id: item.price.id } },
        quantity: item.quantity || 1
      }))
    }
  };
  if (data.guest) {
    // We create a guest order by providing a guestId
    data.guestId = userId;
  } else {
    data.user = { connect: { id: userId } };
  }

  const order = await prisma.order.create({ data });

  return order.id;
}

export async function updateOrderItem(orderItemId: string, quantity: number) {
  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId }
  });
  if (!item) {
    throw new Error("Unable to update, Order Item not found");
  }
  const newQuantity = item?.quantity + quantity;
  const orderItem = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      quantity: newQuantity
    }
  });
  return orderItem.id;
}

export async function fetchOrders(status?: string) {
  return prisma.order.findMany({
    where: { status },
    orderBy: {
      status: "desc"
      //  createdAt: "desc"
    }
  });
}

export async function getOrderCount(status?: string) {
  return prisma.order.count({ where: { status } });
}

export async function fetchOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: { include: { price: true, product: true } },
      user: { select: { username: true, email: true } }
    }
  });
}

export async function deleteOrder(id: string) {
  return prisma.order.delete({ where: { id } });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status } });
}
