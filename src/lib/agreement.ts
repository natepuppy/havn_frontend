export function agreementLabel(status: string | null | undefined) {
  switch (status) {
    case "sent":
    case "delivered":
      return "Sent";
    case "awaiting_corporate_signature":
      return "Awaiting Corporate Signature";
    case "completed":
      return "Completed";
    case "declined":
      return "Declined";
    case "voided":
      return "Voided";
    case "failed":
      return "Failed";
    case "queued":
      return "Queued";
    default:
      return "Not sent";
  }
}

export function agreementColor(status: string | null | undefined) {
  if (status === "completed" || status === "sent" || status === "delivered") return "green";
  if (status === "awaiting_corporate_signature") return "gold";
  if (status === "failed" || status === "declined" || status === "voided") return "red";
  return "default";
}

export function repStatusLabel(rep: { active: boolean; rep_signed: boolean }) {
  if (!rep.active) return "Deactivated";
  if (rep.rep_signed) return "Active";
  return "Pending";
}
