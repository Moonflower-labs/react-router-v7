import { Link, Outlet } from "react-router";
import type { Route } from "./+types/index";
import { requireUserId } from "~/utils/session.server";
import { getUserSubscription } from "~/models/subscription.server";
import { stripe } from "~/integrations/stripe";
import type Stripe from "stripe";
import { GoArrowRight } from "react-icons/go";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const subscription = await getUserSubscription(userId)
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription?.id as string, { expand: ["default_payment_method"] }) as Stripe.Subscription;
  const paymentMethod = stripeSubscription?.default_payment_method as Stripe.PaymentMethod ?? null;

  return { subscription, paymentMethod }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const subscription = loaderData?.subscription;
  const paymentMethod = loaderData?.paymentMethod;
  console.log(loaderData.paymentMethod)

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary font-bold py-4">Mi Suscripción</h2>

      {subscription ? (
        <div className="overflow-x-auto mt-8 w-full">
          <div className="flex flex-col gap-3 border border-black md:w-1/2 p-3 mx-auto rounded-md">
            <div className="flex flex-row gap-4 justify-between items-center">
              <span className="font-bold">Plan</span>
              <span>{subscription.plan?.name}</span>
            </div>
            <div className="flex flex-row gap-4 justify-between items-center">
              <span className="font-bold">Tarjeta</span>
              {paymentMethod
                ? <div className="flex flex-col justify-center items-center">
                  <div className="flex justify-center items-center gap-1">
                    <span className="capitalize">{paymentMethod.card?.brand}</span>
                    <span>●●●●</span>
                    <span>{paymentMethod.card?.last4}</span>
                  </div>
                  <div className="flex justify-center items-center gap-1 text-neutral/65">
                    <span className="capitalize">Expires</span>
                    <span>{paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year}</span>
                  </div>
                </div>
                : <span>⚠️  <Link to="/payments/setup" className="link link-primary">Añadir tarjeta</Link></span>}
            </div>

            <div className="flex flex-row gap-4 items-center">
              <span className="font-bold">
                Cambiar de Plan
              </span>
              <Link to="update" className="link link-primary"><GoArrowRight size={24} /></Link>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="font-bold">
                Cancelar Plan
              </span>
              <Link to="delete" className="link link-primary"><GoArrowRight size={24} /></Link>
            </div>
          </div>
          <Outlet context={{ subscription, paymentMethod }} />
        </div>
      ) : (
        <div className="text-xl text-center text-semibold pt-8">No tienes ninguna suscripción.</div>
      )}
    </div>
  );
}
