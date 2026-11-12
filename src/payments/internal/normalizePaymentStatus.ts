export type PaymentStatus = "paid" | "processing" | "failed";

type InternalProvider = "stripe" | "training";

export function normalizePaymentStatus(
  provider: InternalProvider,
  providerStatus: string
): PaymentStatus {
  if (provider === "stripe") {
    if (providerStatus === "succeeded") return "paid";
    if (providerStatus === "requires_action") return "processing";
    if (providerStatus === "declined") return "failed";
  }

  if (provider === "training") {
    if (providerStatus === "approved") return "paid";
    if (providerStatus === "queued") return "processing";
    if (providerStatus === "rejected") return "failed";
  }

  // Невідомий статус не підтверджує успішну оплату.
  return "failed";
}