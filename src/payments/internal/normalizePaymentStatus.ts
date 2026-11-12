
export type PaymentStatus = "paid" | "processing" | "failed";

export function normalizePaymentStatus(
  provider: "stripe",
  providerStatus: string
): PaymentStatus {
  if (provider === "stripe") {
    if (providerStatus === "succeeded") {
      return "paid";
    }

    if (providerStatus === "requires_action") {
      return "processing";
    }

    if (providerStatus === "declined") {
      return "failed";
    }
  }

  // Unknown status must never be treated as paid.
  return "failed";
}
