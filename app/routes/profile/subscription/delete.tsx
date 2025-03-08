import { Form, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/delete";
import { cancelStripeSubscription } from "~/integrations/stripe";
import { formatDate } from "~/utils/format";
import { useCallback } from "react";


export async function action({ request }: Route.LoaderArgs) {
  const formData = await request.formData();
  const method = request.method;
  if (method === "DELETE") {
    const subscriptionId = formData.get("subscriptionId") as string
    try {
      const canceledSubscription = await cancelStripeSubscription(subscriptionId)
      return { cancellationDate: new Date(canceledSubscription.current_period_end * 1000) }
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}

export default function Component({ actionData }: Route.ComponentProps) {
  const { subscription } = useRouteLoaderData("profile-subscription");
  const cancellationDate = actionData?.cancellationDate
  const ref = useCallback((node: HTMLDivElement | null) => node?.scrollIntoView({ behavior: "smooth" }), [])

  return (
    <div className="text-center" ref={ref}>
      <h2 className="text-2xl text-primary my-3">Cancela tu suscripción</h2>
      {subscription.cancellationDate ?
        <p className="mb-4 max-w-xl mx-auto px-3">
          Tu suscripción no se volverá a renovar, y será cancelada el {formatDate(subscription.cancellationDate)} .
        </p> :
        <>
          {cancellationDate ?
            <p className="mb-4 max-w-xl mx-auto px-3">Tu subscripción será cancelada el
              <span className="text-error"> {cancellationDate.toLocaleDateString()}</span>.
              Hasta entonces si por algún motivo cambiases de plan, la cancelación será suspendida y continuarás con el plan elegido.
            </p>
            : <>
              <p className="mb-4 max-w-xl mx-auto px-3">
                Al cancelar tu suscripción ya no se volverá a renovar, y perderás acceso a las páginas y contenido desde esa misma fecha.
              </p>
              <Form method="delete" className="py-2 mx-auto mb-4">
                <button type="submit" name="subscriptionId" value={subscription.id} className="btn btn-outline btn-error btn-sm">Cancelar ahora</button>
              </Form></>}
        </>}

    </div>
  );
}
