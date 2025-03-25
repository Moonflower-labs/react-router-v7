import { data, href, Link } from "react-router";
import type { Route } from "./+types/cart";
import { CartItem as Item } from "~/components/shop/CartItem";
import { addToCart, calculateTotalAmount, getShoppingCart, removeFromCart } from "~/models/cart.server";
import { useState } from "react";
import { motion } from "motion/react";
import { getShippinRates } from "~/models/shippingRate";
import { getUserById, getUserDiscount } from "~/models/user.server";
import type { SubscriptionPlan } from "~/integrations/stripe/subscription.server";
import { getCustomerBalance } from "~/integrations/stripe/customer.server";
import { getSessionContext } from "~/middleware/sessionMiddleware";
import { CustomAlert } from "~/components/shared/info";

export async function loader({ context }: Route.LoaderArgs) {
  const session = getSessionContext(context)
  const userId = session.get("userId")

  const [user, cart, shippingRates] = await Promise.all([
    getUserById(userId),
    getShoppingCart(userId as string),
    getShippinRates()
  ])

  const discount = getUserDiscount(user?.subscription?.plan?.name as SubscriptionPlan["name"])
  const totalAmount = calculateTotalAmount(cart?.cartItems || []);

  if (!user) return { cart, totalAmount, shippingRates, discount };

  let customerBalance = 0;
  if (user?.customerId) {
    customerBalance = await getCustomerBalance(user.customerId);
  }

  return { cart, totalAmount, shippingRates, discount, customerBalance };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const priceId = formData.get("priceId");
  const session = getSessionContext(context)
  const userId = session.get("userId");

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
  const { cart, shippingRates, customerBalance = 0, totalAmount, discount } = loaderData;
  const [selectedRateId, setSelectedRateId] = useState<string | undefined>(undefined);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value; // This will be the rate.id
    setSelectedRateId(value);
  };

  const selectedRate = shippingRates?.find((rate) => rate.id === selectedRateId);

  return (
    <div className="bg-base-100 p-6 min-h-[80vh] flex flex-col justify-center items-center rounded-lg">
      <h1 className="text-3xl font-semibold py-3">Cesta</h1>
      {cart?.cartItems && cart?.cartItems?.length > 0 ? (
        <>
          <ul className="list rounded-box shadow-md overflow-auto mb-4">
            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Mis artículos</li>
            {cart.cartItems.map(item => (
              <Item key={item.id} item={item} />
            ))}
          </ul>
          <div className="font-bold my-4">Subtotal £{totalAmount / 100}</div>
        </>
      ) : (
        <div>Cesta vacía</div>
      )}

      <Link to={href("/store")} className="link-primary block" viewTransition>
        {cart?.cartItems && cart?.cartItems?.length > 0 ? "Continúa comprando" : "Visita la Tienda"}
      </Link>

      {cart?.cartItems && cart.cartItems.length > 0 &&
        <>
          <CustomAlert level="warning" className="">
            <h3 className="text-lg font-bold">Sobre los gastos postales</h3>
            <ul className="list list-disc px-3 pb-2">
              <li className="mb-1.5">
                Es tu responsabilidad el elegir la opción adecuada para tu destino.
              </li>
              <li className="mb-1.5">
                Para pedidos que <span className="font-bold">solo</span> contengan artículos digitales selecciona la opción gratuita.
              </li>
              <li className="mb-1.5">
                <span className="font-bold">No</span> seleccione la opción gratuita si está comprando artículos físicos o su pedido no se podrá procesar.
              </li>
            </ul>
          </CustomAlert>
          {/* Shipping rates*/}
          {shippingRates && shippingRates.length ?
            <select
              id="shipping"
              name="shipping-rate"
              value={selectedRateId ?? ""}
              onChange={handleChange}
              className="select mb-4 w-full md:w-[70%] mx-auto">
              <option value={""} disabled>
                Seleciona una opción de envío para continuar
              </option>
              {shippingRates.map((rate) =>
                <option key={rate.id} value={rate.id}>{rate.displayName}</option>
              )}
            </select>
            : null}
          {/* Display amounts */}
          <div className="mb-4 mt-3">
            <div className="font-bold">Gastos Postales £{selectedRate?.amount ? selectedRate.amount / 100 : 0}</div>
            {customerBalance > 0 && <div className="font-bold">Crédito disponible £{customerBalance / 100}</div>}
            <div className="font-bold">Total Artículos + Envío £{(totalAmount + (selectedRate?.amount ? selectedRate.amount : 0)) / 100}</div>
            {discount > 0 && <div className="font-bold text-success mb-2">Descuento de {discount}% será applicado en Checkout (-£{((totalAmount * discount / 100) / 100).toFixed(2)})</div>}
            <div className="font-bold">Total a Pagar £{Math.max((totalAmount + (selectedRate?.amount ? selectedRate.amount : 0) - (customerBalance ?? 0)), 50) / 100}</div>
          </div>
          {/* Checkout button */}
          {selectedRateId && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 0 }}
              animate={{ opacity: 1, height: "auto", y: -10 }}
            >
              <Link to={`${href("/payments/checkout")}?shipping=${selectedRateId}`} state={{ mode: "payment" }} className="btn btn-primary my-5 mx-auto" viewTransition>
                Checkout
              </Link>
            </motion.div>
          )}
        </>
      }
    </div>
  );
}


