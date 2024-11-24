export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function calculateRenewalDate(date: Date | undefined) {
  if (!date) return;
  const renewalDate = new Date(date);
  renewalDate.setMonth(renewalDate.getMonth() + 1);
  return renewalDate;
}

export function getReplyDepth(replies, currentDepth = 0) {
  // Check if there are any replies
  if (!replies || replies.length === 0) {
    return currentDepth;
  }

  // Increment the depth for each level
  let maxDepth = currentDepth;

  replies.forEach(reply => {
    const depth = getReplyDepth(reply.replies, currentDepth + 1);
    maxDepth = Math.max(maxDepth, depth);
  });

  return maxDepth;
}
