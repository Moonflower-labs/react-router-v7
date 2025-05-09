import { href, Link, Outlet, redirect } from "react-router";
import type { Route } from "./+types/index";
import { getUserSubscription } from "~/models/subscription.server";
import { getSubscriptionData, stripe, type SubscriptionPlan } from "~/integrations/stripe/index.server";
import type Stripe from "stripe";
import { GoArrowRight } from "react-icons/go";
import { CustomAlert } from "~/components/shared/info";
import { formatDayTimeEs } from "~/utils/format";
import { calculateRenewalDate } from "~/utils/helpers";
import { translateSubscriptionStatus } from "~/utils/translations";
import { RiDeleteBin6Line } from "react-icons/ri";
import { GrUpdate } from "react-icons/gr";
import { BiErrorCircle } from "react-icons/bi";
import { getUserId } from "~/middleware/sessionMiddleware";

export async function loader({ context }: Route.LoaderArgs) {
  const userId = getUserId(context);
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    throw redirect(href("/profile"))
  }
  if (subscription.status === "past_due") {
    throw redirect(`${href("/payments/subscribe")}?missed=true&subscriptionId=${subscription.id}&plan=${subscription.plan.name}`)
  }

  const planData = getSubscriptionData(subscription?.plan?.name as SubscriptionPlan["name"]);
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription?.id as string, { expand: ["default_payment_method"] }) as Stripe.Subscription;
  const paymentMethod = stripeSubscription?.default_payment_method as Stripe.PaymentMethod ?? null;

  return { subscription, paymentMethod, planData, stripeSubscription }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { subscription, paymentMethod, planData } = loaderData;
  const isPastDue = subscription.status === "past_due"

  // console.log(loaderData.stripeSubscription)
  // console.log(subscription)




  return (
    <main className="text-center pb-8 mx-2">
      <h2 className="text-2xl text-primary font-bold py-4">Mi Suscripción</h2>
      <div className="md:w-fit md:mx-auto my-2">
        {isPastDue && (
          <div role="alert" className="alert alert-warning">
            <BiErrorCircle size={24} />
            <div className="text-center">
              <p className="mb-3">Renovacion Incompleta! No hemos podido recolectar el pago de su suscripción.</p>
              <Link
                to={`${href("/payments/subscribe")}?missed=true&subscriptionId=${subscription.id}&plan=${subscription.plan.name}`}
                className="text-center btn btn-primary"
              >Resolver pago</Link>
            </div>
          </div>
        )}
      </div>
      {subscription?.cancellationDate &&
        <CustomAlert level="warning" className="mb-4">Subscripción pendiente de cancelación el {formatDayTimeEs(subscription.cancellationDate)}</CustomAlert>
      }
      <div className="mb-4 border shadow-sm rounded-lg p-4 md:w-1/2 mx-auto flex flex-col gap-3">
        <p className="flex justify-between items-center">
          <span className="font-semibold">Estado</span>
          <span className={`font-semibold badge ${isPastDue ? "badge-warning" : "badge-success"}`}>{translateSubscriptionStatus(subscription?.status)}</span>
        </p>
      </div>
      <div className="mb-4 border shadow-sm rounded-lg p-4 md:w-1/2 mx-auto flex flex-col gap-3">
        <h2 className="text-xl font-bold py-3">Plan</h2>
        <div className="flex-grow flex flex-col gap-2 items-center">
          <div className="avatar">
            <div className="w-20 rounded-lg">
              <img src={planData?.img} />
            </div>
          </div>
          <span className="font-semibold">{subscription?.plan?.name}</span>
        </div>
        <p className="flex justify-between">
          <span>Actualizado</span>
          <span className="font-semibold">{formatDayTimeEs(subscription?.updatedAt)}</span>
        </p>
        <p className="flex justify-between">
          <span>Próxima renovación</span>
          <span className="font-semibold">{formatDayTimeEs(calculateRenewalDate(subscription?.updatedAt) as Date)}</span>
        </p>
        {/* Only show for active subscriptions */}
        {!isPastDue ? (
          <>
            {paymentMethod ? <div className="flex flex-row gap-4 justify-between items-center">
              <span className="font-bold">
                Cambiar Plan
              </span>
              <Link to={"/profile/subscription/update"} className="btn btn-sm btn-primary btn-outline" preventScrollReset>
                <GrUpdate size={24} />
              </Link>
            </div> : null}
            {!subscription?.cancellationDate && (
              <div className="flex flex-row gap-4 justify-between items-center">
                <span className="font-bold">
                  Cancelar suscripción
                </span>
                <Link to={"/profile/subscription/delete"} className="btn btn-sm btn-error btn-outline " preventScrollReset>
                  <RiDeleteBin6Line size={24} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Todo: add terminate subscription option by calling stripe.subscription.del() */}
          </>
        )}
      </div>
      {subscription ? (
        <div className="overflow-x-auto mt-8 w-full">
          <div className="flex flex-col gap-2 border-base-content shadow-sm md:w-1/2 p-3 mx-auto rounded-md">
            <h2 className="text-xl text-center font-bold">Método de pago</h2>
            {paymentMethod ?
              <>
                <div className="flex flex-row gap-4 justify-between items-center">
                  <span className="font-bold">Tarjeta</span>
                  <span className="capitalize">{paymentMethod.card?.brand}</span>
                </div>
                <div className="flex flex-row gap-4 justify-between items-center">
                  <span className="font-bold">Últimos 4 dígitos</span>
                  <div className="flex justify-center items-center gap-1">
                    <span>●●●●</span>
                    <span>{paymentMethod.card?.last4}</span>
                  </div>
                </div>
                <div className="flex flex-row gap-4 justify-between items-center">
                  <span className="font-bold">Expiración</span>
                  <span>{paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year}</span>
                </div>
              </>
              : <span>⚠️  <Link to="/payments/setup" className="link link-primary">Añadir tarjeta</Link></span>
            }
            <div className="flex flex-row gap-4 justify-between items-center">
              <span className="font-bold">
                Actualizar mi método de pago
              </span>
              <Link to={href("/payments/setup")} className="link link-primary">
                <GoArrowRight size={24} />
              </Link>
            </div>
          </div>
          <Outlet />
        </div>
      ) : (
        <div className="text-xl text-center text-semibold pt-8">No tienes ninguna suscripción.</div>
      )}
    </main>
  );
}
