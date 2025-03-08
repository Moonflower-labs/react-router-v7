import { data, Form, href, Link, redirect, useNavigation, useOutletContext, useRouteLoaderData, useSubmit } from "react-router";
import { useCallback, useState } from "react";
import { isSubscriptionDefaultPaymentMethodValid, PLANS, updateStripeSubscription } from "~/integrations/stripe";
import type { Route } from "./+types/update";
import { getUserById } from "~/models/user.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { formatUnixDate } from "~/utils/format";
import { createPreviewInvoice } from "~/integrations/stripe/invoice.server";
import InfoAlert from "~/components/shared/info";
import { getSubscription, getUserSubscription } from "~/models/subscription.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  const userSubscription = await getUserSubscription(userId as string)
  let error = null
  if (userSubscription?.status === "past_due") {
    throw redirect(href("/profile/subscription"))
  }
  if (!await isSubscriptionDefaultPaymentMethodValid(userSubscription?.id as string)) {
    error = "No default payment method attached"
  }
  return { PLANS, error };
}

export async function action({ request }: Route.ActionArgs) {
  switch (request.method) {
    case "POST": {
      const userId = await requireUserId(request);
      const user = await getUserById(userId);
      const customerId = user?.customerId;
      const jsonData = await request.json();
      const subscriptionId = jsonData?.subscriptionId;
      const newPriceId = jsonData?.priceId;
      if (!customerId || !subscriptionId || !newPriceId) {
        return { error: "Missing required parameters" };
      }

      try {
        const preview = await createPreviewInvoice({ customerId, subscriptionId, newPriceId });
        return { preview };
      } catch (e) {
        console.error(e);
        return { success: false, message: "Ha ocurrido un error" };
      }
    }
    case "PUT": {
      const formData = await request.formData();
      const subscriptionId = formData.get("subscriptionId");
      const newPriceId = formData.get("priceId") as string;

      if (!subscriptionId || !newPriceId) {
        return { success: false, message: "Missing required parameters" };
      }
      const subscription = await getSubscription(String(subscriptionId))
      try {
        await updateStripeSubscription(String(subscriptionId), newPriceId)


      } catch (e) {
        console.error(e);
        // todo: allow for expired payment_method :)
        // const {updatedSubscription,error}  =  await updateStripeSubscription(String(subscriptionId), newPriceId)
        if (e instanceof Error) {
          if (e.message === "requires_payment_method") {
            // todo: add query search params
            throw redirect(`${href("/payments/subscribe")}?missed=true&subscriptionId=${subscriptionId}&plan=${subscription?.plan?.name}`)
          } else if (e.message === "something_else") {
            // fix something else :)
          }
        }
        return { success: false, message: "Ha ocurrido un error" };
      }
      return redirect("/profile/subscription/confirmation");
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
}

export default function UpdateSubscriptionPage({ loaderData, actionData }: Route.ComponentProps) {
  const { subscription } = useRouteLoaderData("profile-subscription");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const previewInvoice = actionData?.preview;
  const previewInvoiceRef = useCallback((node: HTMLDivElement | null) => node?.scrollIntoView({ behavior: "smooth" }), [previewInvoice])
  const ref = useCallback((node: HTMLDivElement | null) => node?.scrollIntoView({ behavior: "smooth", block: "center" }), [])

  const navigation = useNavigation();
  const submit = useSubmit();
  const plans = loaderData?.PLANS;

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-3" ref={ref}>Actualiza tu plan</h2>
      <p className="mb-6">Elige el plan al que deseas cambiar.</p>
      {loaderData?.error && <InfoAlert level="Importante" className="alert alert-error">Actualiza el método de pago para continuar. Pincha <Link to="/payments/setup" className="link">aquí.</Link> </InfoAlert>}
      <div className="flex flex-col md:flex-row gap-3 md:w-2/3 mx-auto justify-around mb-4">
        {plans
          .filter((p) => p.name !== subscription?.plan?.name)
          .map((plan) => (
            <label
              key={plan.priceId}
              className={`label cursor-pointer max-w-xs p-4 border rounded-lg shadow-xl mx-auto ${selectedPlan === plan.priceId ? "border-primary" : "border-gray-200"
                }`}
              onClick={() => {
                // if (loaderData?.error?.toString().trim() === "") {
                //   const searchParams = new URLSearchParams([["plan", plan.name]])
                //   return submit(searchParams, { action: "/payments/subscribe" });
                // }
                setSelectedPlan(plan.priceId);
                submit({ priceId: plan.priceId, subscriptionId: subscription?.id }, { method: "POST", encType: "application/json" });
              }}>
              <input
                type="radio"
                name="priceId"
                className="hidden"
                value={plan.priceId}
                checked={selectedPlan === plan.priceId}
                onChange={() => setSelectedPlan(plan.priceId)}
              />
              <div className="flex flex-col items-center">
                <img src={plan.img} alt={plan.name} className="mb-2 rounded-lg aspect-square object-cover" height={250} width={250} />
                <span className="label-text font-bold text-primary text-xl">{plan.name}</span>
                <span className="label-text font-bold">£{plan.amount / 100}</span>
              </div>
            </label>
          ))}
      </div>
      {navigation.state === "submitting" && <span className="loading loading-spinner text-primary"></span>}
      {actionData?.message && <span className="text-error">{actionData.message} </span>}
      <Form method="put" className="py-2 mx-auto">
        <input type="hidden" name="priceId" value={String(selectedPlan)} />
        {previewInvoice && (
          <div
            className="py-8 px-6 focus:outline-none"
            ref={previewInvoiceRef}
          >
            <p>INFO </p>
            <p>
              Fecha de prorrateo <span className="font-bold">{formatUnixDate(previewInvoice.subscription_proration_date!)}</span>
            </p>
            <p>
              Periodo de facturado del <span className="font-bold">{formatUnixDate(previewInvoice.period_start)}</span> al <span className="font-bold">{formatUnixDate(previewInvoice.period_end)}</span>{" "}
            </p>
            {previewInvoice?.lines?.data.map((item) => (
              <div key={item.description}>
                <p>
                  PERIODO: del <span className="font-bold">{formatUnixDate(item.period.start)}</span> al <span className="font-bold">{formatUnixDate(item.period.end)}</span>{" "}
                </p>
                <p>
                  {item?.description} <span className="font-bold">£{item?.amount / 100}</span>
                </p>
              </div>
            ))}
            <p>
              Total a pagar <span className="font-bold">£{previewInvoice.total / 100}</span>
            </p>
            <div className="flex items-center justify-center gap-4 my-8 mx-auto">
              <Link className="btn btn-outline btn-error btn-sm" to={"/profile/subscription"}>
                Cancelar
              </Link>
              <button
                type="submit"
                name="subscriptionId"
                value={subscription?.id}
                disabled={navigation.state === "submitting" || loaderData?.error !== null}
                className="btn btn-outline btn-primary btn-sm">
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Form>
    </div>
  );
}