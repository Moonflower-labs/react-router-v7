import { transporter } from "./mailer.server";

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: "admin@thechicnoir.com",
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Use this link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
               <a href="${resetUrl}">Reset Password</a>`
  });
}
