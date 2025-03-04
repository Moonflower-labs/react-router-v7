import { prisma } from "~/db.server";
import { stripe } from "~/integrations/stripe";
import type { Route } from "./+types/update-guest-order";

export async function action({ request }: Route.ActionArgs) {

    const { orderId, guestEmail } = await request.json();
    if (!orderId || !guestEmail) return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { guestEmail },
    });

    if (!order?.paymentIntentId) return new Response(JSON.stringify({ error: "No Payment Intent found" }), { status: 400 });

    await stripe.paymentIntents.update(order.paymentIntentId, {
        metadata: { guestEmail },
    });

    return Response.json({ success: true });
}
