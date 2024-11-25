import { data, Form, Link, redirect, useNavigation, useOutletContext, useSubmit } from "react-router";
import { useCallback, useState } from "react";
import { PLANS, retrieveSubscription, stripe } from "~/integrations/stripe";
import type { Route } from "./+types/update";
import { getUserById } from "~/models/user.server";
import { requireUserId } from "~/utils/session.server";
import { formatUnixDate } from "~/utils/format";
import { motion } from "framer-motion";
import { createPreviewInvoice } from "~/integrations/stripe/invoice.server";

export async function loader() {
  return PLANS;
}

export async function action({ request }: Route.ActionArgs) {
  switch (request.method) {
    case "PUT": {
      const formData = await request.formData();
      const subscriptionId = formData.get("subscriptionId");
      const newPriceId = formData.get("priceId");

      if (!subscriptionId || !newPriceId) {
        return { success: false, message: "Missing required parameters" };
      }
      try {
        const subscription = await retrieveSubscription(String(subscriptionId));
        await stripe.subscriptions.update(String(subscriptionId), {
          items: [
            {
              id: subscription.items.data[0].id,
              price: String(newPriceId)
            }
          ],
          proration_behavior: "always_invoice",
          proration_date: Math.floor(Date.now() / 1000),
          expand: ["latest_invoice.payment_intent"]
        });
      } catch (error) {
        console.error(error);
        return { success: false, message: "Ha ocurrido un error" };
      }
      throw redirect("/profile/plan/confirmation");
    }

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
      // Check customer balance
      const customer = await stripe.customers.retrieve(customerId);
      console.log(customer);

      try {
        const subscription = await retrieveSubscription(subscriptionId);
        const itemId = subscription.items.data[0].id;
        const preview = await createPreviewInvoice({ customerId, subscriptionId, itemId, newPriceId });
        return { preview };
      } catch (error) {
        console.error(error);
        return { success: false, message: "Ha ocurrido un error" };
      }
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
}

export default function UpdateSubscription({ loaderData, actionData }: Route.ComponentProps) {
  const { subscription }: any = useOutletContext() || {};
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => { node?.focus(); }, [])
  const previewInvoice = actionData?.preview;
  const navigation = useNavigation();
  const submit = useSubmit();
  const plans = loaderData;


  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-3">Actualiza tu plan</h2>
      <p className="mb-6">Elige el plan al que deseas cambiar.</p>
      <div className="flex flex-col md:flex-row gap-3 md:w-2/3 mx-auto justify-around mb-4">
        {plans
          .filter((p) => p.name !== subscription?.plan?.name)
          .map((plan) => (
            <label
              key={plan.priceId}
              className={`label cursor-pointer max-w-xs p-4 border rounded-lg shadow-xl mx-auto ${selectedPlan === plan.priceId ? "border-primary" : "border-gray-200"
                }`}
              onClick={() => {
                setSelectedPlan(plan.priceId);
                submit({ priceId: plan.priceId, subscriptionId: subscription?.id }, { method: "post", encType: "application/json" });
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
                <img src={plan.img} alt={plan.name} className="mb-2 rounded-lg" height={250} width={250} />
                <span className="label-text font-bold text-primary text-xl">{plan.name}</span>
                <span className="label-text font-bold">£{plan.amount / 100}</span>
              </div>
            </label>
          ))}
      </div>
      {navigation.state === "submitting" && <span className="loading loading-spinner text-primary"></span>}
      {actionData?.message && <span className="text-error">{actionData.message}</span>}
      <Form method="put" className="py-2 mx-auto">
        <input type="hidden" name="priceId" value={String(selectedPlan)} />
        {previewInvoice && (
          <motion.div
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            transition={{ duration: 1.2 }}
            className="py-8 px-6 focus:outline-none"
            ref={ref} tabIndex={0}
          >
            <p>INFO </p>
            <p>
              Periodo de facturación desde el {formatUnixDate(previewInvoice.period_start)} al {formatUnixDate(previewInvoice.period_end)}{" "}
            </p>
            {previewInvoice?.lines?.data.map((item) => (
              <div key={item.description}>
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
                disabled={navigation.state === "submitting"}
                className="btn btn-outline btn-primary btn-sm">
                Confirmar
              </button>
            </div>
          </motion.div>
        )}
      </Form>
    </div>
  );
}