import { transporter } from "./mailer.server";
import { renderWelcomeEmail } from "./html-templates/welcome";
import { renderNewOrderEmail } from "./html-templates/new-order";
import type { ExtendedOrder } from "~/models/order.server";
import { getSubscriptionData, type SubscriptionPlan } from "../stripe";
import { renderNewSubscriptionEmail } from "./html-templates/new-subscription";
import { renderMissedSubscriptionPaymentEmail } from "./html-templates/missed-payment";
import { renderResetPasswordEmail } from "./html-templates/reset-password";
import { renderUpdatedSubscriptionEmail } from "./html-templates/updated-subscription";

export async function sendWelcomeEmail(email: string, username: string) {
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Bienvenido a La Flor Blanca!",
    text: `Bienvenido a La Flor Blanca!`,
    html: await renderWelcomeEmail({ username })
  });
}

export async function sendSubscriptionEmail(email: string, username: string, plan: SubscriptionPlan["name"]) {
  const planData = getSubscriptionData(plan);
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: `Tu suscripción a ${planData.name}`,
    text: `Tu suscripción a La Flor Blanca`,
    html: await renderNewSubscriptionEmail({ planData, username })
  });
}

export async function sendSubscriptionUpdatedEmail(
  email: string,
  username: string,
  plan: SubscriptionPlan["name"],
  updateType: "upgrade" | "downgrade" | "renewal" | "new" | "unknown"
) {
  // todo: construct this email remarking changes
  const planData = getSubscriptionData(plan);
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: `Tu suscripción a ${planData.name}`,
    text: `Tu suscripción a La Flor Blanca`,
    html:
      updateType === "new"
        ? await renderNewSubscriptionEmail({ planData, username })
        : await renderUpdatedSubscriptionEmail({ planData, username, updateType })
  });
}

export async function sendMissedSubscriptionPaymentEmail(
  email: string,
  username: string,
  plan: SubscriptionPlan["name"]
) {
  const planData = getSubscriptionData(plan);
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: `Tu suscripción a ${planData.name}`,
    text: `Tu suscripción a La Flor Blanca`,
    html: await renderMissedSubscriptionPaymentEmail({ planData, username })
  });
}

export async function sendOrderEmail(email: string, username: string, order: ExtendedOrder) {
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Tu pedido con La Flor Blanca",
    text: `Tu pedido con La Flor Blanca`,
    html: await renderNewOrderEmail({ order, username })
  });
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Resetea tu contraseña con La Flor Blanca",
    text: `Resetea tu contraseña. Usa este enlace: ${resetUrl}`,
    html: await renderResetPasswordEmail({ resetPasswordLink: resetUrl, email })
  });
}
