import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.uenimail.com",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  },
  logger: false,
  debug: false
});

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  try {
    const info = await transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (error) {
    console.error(error);
  }
}
