import { stripe } from "~/integrations/stripe";
import type { Route } from "./+types/invoice";

export async function action({ request }: Route.ActionArgs) {
    const body = await request.json();
    const invoiceId = body?.invoiceId;
    if (invoiceId) {
        try {
            // Mark invoice as paid
            await stripe.invoices.pay(invoiceId, {
                paid_out_of_band: true
            });

            return Response.json({ success: true });
        }
        catch (error) {
            return Response.json({ error: "Error while managing invoice status" });
        }
    }
    return null
}
