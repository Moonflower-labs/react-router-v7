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

export async function loader({ context }: Route.LoaderArgs) {
  const session = getSessionContext(context)
  const userId = session.get("userId")
  const user = await getUserById(userId);
  const [cart, shippingRates] = await Promise.all([getShoppingCart(userId as string), getShippinRates()])

  const discount = getUserDiscount(user?.subscription?.plan?.name as SubscriptionPlan["name"])
  const totalAmount = calculateTotalAmount(cart?.cartItems || [], discount);

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
    <div className="bg-base-100 p-10 min-h-[80vh] flex flex-col justify-center items-center rounded-lg">
      <h1 className="text-3xl font-semibold py-3">Cesta</h1>
      {cart?.cartItems && cart?.cartItems?.length > 0 ? (
        <>
          <div className="w-screen overflow-y-auto overflow-x-auto mb-4">
            <table className="table">
              <tbody>
                {cart.cartItems.map(item => (
                  <Item key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="font-bold my-4">Subtotal £{totalAmount / 100}</div>

          <div role="alert" className="alert flex flex-col alert-warning mb-4 md:w-[60%] mx-auto">
            <div className="flex gap-3 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-bold">Sobre los gastos postales</h3>
            </div>

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
          </div>

          {shippingRates && shippingRates.length > 0 ?
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

          <div className="mb-4 mt-3">
            <div className="font-bold">Gastos Postales £{selectedRate?.amount ? selectedRate.amount / 100 : 0}</div>
            {customerBalance > 0 && <div className="font-bold">Crédito disponible £{customerBalance / 100}</div>}
            <div className="font-bold">Total Artículos + Envío £{(totalAmount + (selectedRate?.amount ? selectedRate.amount : 0)) / 100}</div>
            {discount > 0 && <div className="font-bold text-success my-2">Descuento de {discount}% será applicado en Checkout (-£{((totalAmount * discount / 100) / 100).toFixed(2)})</div>}
            <div className="font-bold">Total a Pagar £{Math.max((totalAmount + (selectedRate?.amount ? selectedRate.amount : 0) - (customerBalance ?? 0)), 50) / 100}</div>
          </div>
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
      ) : (
        <div>Cesta vacía</div>
      )}

      <Link to={"/store"} className="link-primary block" viewTransition>
        {cart?.cartItems && cart?.cartItems?.length > 0 ? "Continúa comprando" : "Visita la Tienda"}
      </Link>
    </div>
  );
}
