import { transporter } from "./mailer.server";
import { renderWelcomeEmail } from "./html-templates/welcome";
import { renderNewOrderEmail } from "./html-templates/new-order";
import type { ExtendedOrder } from "~/models/order.server";
import { getSubscriptionData, type SubscriptionPlan } from "../stripe/subscription.server";
import { renderMissedSubscriptionPaymentEmail } from "./html-templates/missed-payment";
import { renderResetPasswordEmail } from "./html-templates/reset-password";
import { renderSubscriptionEmail } from "./html-templates/subscription";
import { renderCustomEmail } from "./html-templates/custom-email";

export async function sendWelcomeEmail(email: string, username: string) {
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Bienvenido a La Flor Blanca!",
    text: `Bienvenido a La Flor Blanca!`,
    html: await renderWelcomeEmail({ username })
  });
}

export async function sendSubscriptionEmail(
  email: string,
  username: string,
  plan: SubscriptionPlan["name"],
  updateType: "upgrade" | "downgrade" | "renewal" | "new" | "unknown" = "new"
) {
  const planData = getSubscriptionData(plan);
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: `Tu suscripción a ${planData.name}`,
    text: `Tu suscripción a La Flor Blanca`,
    html: await renderSubscriptionEmail({ planData, username, updateType })
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
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Resetea tu contraseña con La Flor Blanca",
    text: `Resetea tu contraseña. Usa este enlace: ${resetUrl}`,
    html: await renderResetPasswordEmail({ resetPasswordLink: resetUrl, email })
  });
}

export async function sendCustomEmail(email: string, username: string, subject: string, text: string, links: any) {
  return transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: subject,
    text: text,
    html: await renderCustomEmail({ username, links, text, subject })
  });
}

export async function sendEmailsInBatches(
  recipients: { email: string; username: string }[],
  subject: string,
  text: string,
  links: { name: string; url: string }[],
  batchSize = 100
) {
  const batches = [];
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  const results = [];
  for (const batch of batches) {
    const batchPromises = batch.map(
      user => sendCustomEmail(user.email, user.username, subject, text, links).catch(error => ({ error, user })) // Capture errors per user
    );
    results.push(...(await Promise.all(batchPromises)));
  }
  return results;
}
