import { Form, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/test-past_due";
import type { User } from "~/models/user.server";
import { stripe } from "~/integrations/stripe/stripe.server";


export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const subscriptionId = formData.get("subscriptionId");

    if (!subscriptionId) {
        return { error: "Subscription ID is required" };
    }

    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(String(subscriptionId));

    console.log("Initial subscription status:", subscription.status);
    if (subscription.status !== "active") {
        return { error: "Subscription must be active" };
    }

    // Disable retries and ensure immediate failure
    await stripe.subscriptions.update(String(subscriptionId), {
        payment_behavior: "error_if_incomplete",
        collection_method: "charge_automatically",
    });

    // Remove all existing payment methods
    // Detach all payment methods from the customer
    const customerPaymentMethods = await stripe.paymentMethods.list({
        customer: subscription.customer as string, type: "card"
    });
    for (const pm of customerPaymentMethods.data) {
        await stripe.paymentMethods.detach(pm.id);
        console.log("Detached payment method:", pm.id);
    }

    // Attach the failing payment method
    const paymentMethod = await stripe.paymentMethods.attach("pm_card_chargeCustomerFail",
        { customer: subscription.customer as string }
    );
    // Set it as the default payment method
    await stripe.customers.update(subscription.customer as string, {
        invoice_settings: { default_payment_method: paymentMethod.id }, // Fails on charge
    });

    // Set it as the default payment method for the subscription
    // await stripe.subscriptions.update(subscription.id as string, {
    //     default_payment_method: paymentMethod.id,
    //     payment_behavior: "error_if_incomplete",
    //     collection_method: "send_invoice", // Prevent retries
    //     days_until_due: 0
    // });

    // to delete items from that subscription
    // await stripe.subscriptions.update(subscription.id, {
    //     items: [
    //         {
    //             id: "si_Rtck7vsI81tBzC",
    //             deleted: true,
    //         },
    //     ],
    //     proration_behavior: "none", // Avoid prorations
    // });
    // espirit price_1Ng3KKAEZk4zaxmwLuapT9kg
    // alms price_1Ng3GzAEZk4zaxmwyZRkXBiW

    // Ensure a non-zero invoice by adding a priced item (e.g., $10/month)
    await stripe.subscriptions.update(subscription.id, {
        items: [{ price: "price_1Ng3KKAEZk4zaxmwLuapT9kg" }], // Replace with a real test price ID
        billing_cycle_anchor: "now",
        proration_behavior: "none",
    });

    // Void any draft invoices
    const draftInvoices = await stripe.invoices.list({
        subscription: subscriptionId as string,
        status: "draft",
    });
    for (const invoice of draftInvoices.data) {
        await stripe.invoices.voidInvoice(invoice.id);
        console.log("Voided draft invoice:", invoice.id);
    }

    // Move billing cycle to now to ensure a fresh invoice
    await stripe.subscriptions.update(String(subscriptionId), {
        billing_cycle_anchor: 'now',
        proration_behavior: "none", // Avoid prorations complicating things
    });
    console.log("Billing cycle reset");

    // Retrieve the latest invoice after resetting the billing cycle
    const updatedSubscription = await stripe.subscriptions.retrieve(String(subscriptionId));
    let invoice = updatedSubscription.latest_invoice
        ? await stripe.invoices.retrieve(updatedSubscription.latest_invoice as string)
        : null;

    // If no draft invoice or it’s not tied to the subscription properly, create one
    if (!invoice || invoice.status !== "draft" || invoice.amount_due === 0) {
        invoice = await stripe.invoices.create({
            customer: subscription.customer as string,
            subscription: subscriptionId as string,
            auto_advance: true,
            collection_method: "charge_automatically",

        });
        console.log("Created new invoice:", invoice.id, "Amount:", invoice.amount_due);
    }

    // Finalize the invoice
    await stripe.invoices.finalizeInvoice(invoice.id);
    console.log("Finalized invoice:", invoice.id);

    // Attempt payment (should fail)
    await stripe.invoices.pay(invoice.id, { paid_out_of_band: false }).catch((err) => {
        console.log("Payment failed as expected:", err.message);
    });

    // Refresh invoice status
    const finalizedInvoice = await stripe.invoices.retrieve(invoice.id);
    console.log("Invoice status after payment attempt:", finalizedInvoice.status);

    // Check final subscription status
    const finalSubscription = await stripe.subscriptions.retrieve(String(subscriptionId));
    console.log("Final subscription status:", finalSubscription.status);
    let message = "still 'active' "

    if (finalSubscription.status !== "past_due") {
        console.log("Subscription details:", JSON.stringify(finalSubscription, null, 2));
        message = "Subscription set to past_due, check webhook logs"

    }

    return { message };
};

export default function TestPastDue({ actionData }: Route.ComponentProps) {
    const user = useRouteLoaderData("root")?.user as User;

    return (
        <div className="p-10 text-center">
            <h1 className="py-6 text-2xl">Test Past Due for Existing Subscription</h1>
            <div className="p-6">
                {actionData?.error && <p className="text-error">{actionData.error}</p>}
                {actionData?.message && <p>{actionData.message}</p>}
            </div>
            <Form method="post">
                <div>
                    <label htmlFor="subscriptionId" className="input input-lg w-fit mb-4">
                        <span className="label">Subscription ID</span>
                        <input
                            type="text"
                            name="subscriptionId"
                            id="subscriptionId"
                            required
                            defaultValue={user?.subscription?.id}
                            placeholder="sub_xxx"
                            className=" "
                        />
                    </label>
                </div>
                <button type="submit" className="btn btn-warning">Trigger Past Due</button>
            </Form>
        </div>
    );
}


