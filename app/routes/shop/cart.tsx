import { data, Link } from "react-router";
import type { Route } from "./+types/cart";
import { CartItem as Item } from "~/components/shop/CartItem";
import { addToCart, calculateTotalAmount, getShoppingCart, removeFromCart } from "~/models/cart.server";
import { getSession } from "~/utils/session.server";
import type { CartItem } from "~/models/cart.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);
  const userId = session.get("userId");
  const cart = await getShoppingCart(userId);
  const totalAmount = calculateTotalAmount(cart?.cartItems || []);

  return { cart, totalAmount };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const session = await getSession(request);
  const userId = session.get("userId");
  const priceId = formData.get("priceId");

  switch (action) {
    case "addToCart":
    case "decrease": {
      const productId = formData.get("productId");
      const quantity = action === "addToCart" ? 1 : -1;
      await addToCart(userId, String(productId), String(priceId), quantity);
      break;
    }
    case "remove": {
      await removeFromCart(userId, String(priceId));
      break;
    }
    default: {
      throw data("Bad Request", { status: 400 });
    }
  }

  return { success: true };
}

export default function Cart({ loaderData }: Route.ComponentProps) {
  const cartItems = loaderData?.cart?.cartItems as CartItem[];

  return (
    <div className="bg-base-100 p-10 min-h-[80vh] flex flex-col justify-center items-center rounded-lg">
      <h1 className="text-3xl font-semibold py-3">Cesta</h1>
      {cartItems?.length > 0 ? (
        <>
          <div className="w-screen overflow-y-auto overflow-x-auto mb-4">
            <table className="table">
              <tbody>
                {cartItems.map(item => (
                  <Item key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="font-bold">TOTAL £{loaderData?.totalAmount / 100}</div>
          <Link to={"/payments/checkout"} state={{ mode: "payment" }} className="btn btn-primary my-5 mx-auto" viewTransition>
            Checkout
          </Link>
        </>
      ) : (
        <div>Cesta vacía</div>
      )}
      <Link to={"/store"} className="link-primary block" viewTransition>
        Ir a la tienda
      </Link>
    </div>
  );
}
