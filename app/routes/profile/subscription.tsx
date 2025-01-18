import { formatDate } from "~/utils/format";
import { calculateRenewalDate } from "~/utils/helpers";
import { translateSubscriptionStatus } from "~/utils/translations";
import type { Route } from "./+types/subscription";
import { requireUserId } from "~/utils/session.server";
import { getUserSubscription } from "~/models/subscription.server";
import { Link } from "react-router";
import { getSubscriptionData } from "~/integrations/stripe";
import InfoAlert from "~/components/shared/info";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const subscription = await getUserSubscription(userId);
  const planData = getSubscriptionData(subscription?.plan?.name as string);
  return { subscription, planData };
}


export default function Component({ loaderData }: Route.ComponentProps) {
  const subscription = loaderData?.subscription;
  const planData = loaderData?.planData;
  // const lastInvoice = invoice?.hosted_invoice_url || null

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary py-4">My Subscripción</h2>
      <div className="mb-4 border shadow rounded-lg p-4 md:w-2/3 mx-auto flex flex-col gap-2">
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
          Estado <span className="font-semibold">{translateSubscriptionStatus(subscription?.status)}</span>
        </p>
        <p>
          Suscripción creada el <span className="font-semibold">{formatDate(subscription?.createdAt)}</span>
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
          <Link to={"/profile/plan/update"} className="btn btn-sm btn-primary btn-outline">
            Cambiar Plan
          </Link>
          {!subscription?.cancellationDate &&
            <Link to={"/profile/plan/delete"} className="btn btn-sm btn-error">
              Cancelar my Suscripción
            </Link>}
        </div>
      </div>
    </div>
  );
}
