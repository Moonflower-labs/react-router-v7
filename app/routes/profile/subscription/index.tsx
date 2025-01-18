import { Link, Outlet } from "react-router";
import type { Route } from "./+types/index";
import { requireUserId } from "~/utils/session.server";
import { getUserSubscription } from "~/models/subscription.server";
import { getSubscriptionData, stripe } from "~/integrations/stripe";
import type Stripe from "stripe";
import { GoArrowRight } from "react-icons/go";
import InfoAlert from "~/components/shared/info";
import { formatDate } from "~/utils/format";
import { calculateRenewalDate } from "~/utils/helpers";
import { translateSubscriptionStatus } from "~/utils/translations";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const subscription = await getUserSubscription(userId)
  const planData = getSubscriptionData(subscription?.plan?.name as string);
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription?.id as string, { expand: ["default_payment_method"] }) as Stripe.Subscription;
  const paymentMethod = stripeSubscription?.default_payment_method as Stripe.PaymentMethod ?? null;

  return { subscription, paymentMethod, planData }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const subscription = loaderData?.subscription;
  const paymentMethod = loaderData?.paymentMethod;
  const planData = loaderData?.planData;

  return (
    <main className="text-center pb-8">
      <h2 className="text-2xl text-primary font-bold py-4">Mi Suscripción</h2>
      <div className="mb-4 border shadow rounded-lg p-4 md:w-1/2 mx-auto flex flex-col gap-3">
        <div className="flex-grow flex flex-col items-center">
          <div className="avatar">
            <div className="w-20 rounded-lg">
              <img src={planData?.img} />
            </div>
          </div>
        </div>
        <p>
          Plan <span className="font-semibold">{subscription?.plan?.name}</span>
        </p>
        <p>
          <span className={`font-semibold badge ${subscription?.status === "active" ? "badge-success" : "badge-warning"}`}>{translateSubscriptionStatus(subscription?.status)}</span>
        </p>

        <p>
          <span> Creada el </span>
          <span className="font-semibold">{formatDate(subscription?.createdAt)}</span>
        </p>
        <p>
          Plan actualizado el <span className="font-semibold">{formatDate(subscription?.updatedAt)}</span>
        </p>
        <p>
          Próxima renovación <span className="font-semibold">{formatDate(calculateRenewalDate(subscription?.updatedAt))}</span>
        </p>
        {subscription?.cancellationDate &&
          <InfoAlert level="Atención" className="alert-error">Subscripción pendiente de cancelación el {formatDate(subscription.cancellationDate)}</InfoAlert>}
        <div className="flex gap-3 justify-center">
          <Link to={"/profile/subscription/update"} className="btn btn-sm btn-primary btn-outline">
            Cambiar Plan
          </Link>
          {!subscription?.cancellationDate &&
            <Link to={"/profile/subscription/delete"} className="btn btn-sm btn-error">
              Cancelar my Suscripción
            </Link>}
        </div>
      </div>
      {subscription ? (
        <div className="overflow-x-auto mt-8 w-full">
          <div className="flex flex-col gap-3 border shadow md:w-1/2 p-3 mx-auto rounded-md">
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
                : <span>⚠️  <Link to="/payments/setup" className="link link-primary">Añadir tarjeta</Link></span>
              }
            </div>

            <div className="flex flex-row gap-4 items-center">
              <span className="font-bold">
                Actualizar mi método de pago
              </span>
              <Link to="/payments/setup" className="link link-primary">
                <GoArrowRight size={24} />
              </Link>
            </div>

            <div className="flex flex-row gap-4 items-center">
              <span className="font-bold">
                Cambiar de Plan
              </span>
              <Link to="update" className="link link-primary"><GoArrowRight size={24} /></Link>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <span className="font-bold">
                Cancelar Suscripción
              </span>
              <Link to="delete" className="link link-primary"><GoArrowRight size={24} /></Link>
            </div>
          </div>
          <Outlet context={{ subscription, paymentMethod }} />
        </div>
      ) : (
        <div className="text-xl text-center text-semibold pt-8">No tienes ninguna suscripción.</div>
      )}
    </main>
  );
}
