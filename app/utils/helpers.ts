import crypto from "crypto";

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function validateUsername(username: unknown): username is string {
  return (
    typeof username === "string" &&
    username.length > 3 &&
    username.length <= 18 &&
    !username.includes(" ")
  );
}

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function generateResetUrl(token: string): string {
  return `${process.env.APP_URL}/reset-password?token=${token}`;
}

export function calculateRenewalDate(date: Date | undefined) {
  if (!date) return;
  const renewalDate = new Date(date);
  renewalDate.setMonth(renewalDate.getMonth() + 1);
  return renewalDate;
}
