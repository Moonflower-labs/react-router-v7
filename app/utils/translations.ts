export const subscriptionStatusTranslations: Record<string, string> = {
  active: "Activa",
  incomplete: "Incompleta",
  past_due: "Vencida",
  canceled: "Cancelada",
  unpaid: "No pagada",
  trialing: "En prueba"
};

// Could add a helper function if you want
export function translateSubscriptionStatus(status: string | undefined) {
  if (status === undefined) return;
  return subscriptionStatusTranslations[status] || status;
}
