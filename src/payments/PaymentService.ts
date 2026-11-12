import { StripeClient } from "./internal/StripeClient.ts";
import { TrainingPaymentClient } from "./internal/TrainingPaymentClient.ts";
import {
  normalizePaymentStatus,
  type PaymentStatus,
} from "./internal/normalizePaymentStatus.ts";

export type PaymentRequest = Readonly<{
  orderId: string;
  paymentToken: string;
  amount: number;
  currency: string;
}>;

export type PaymentResult = Readonly<{
  status: PaymentStatus;
}>;

export type PaymentProvider = "stripe" | "training";

export class PaymentService {
  private readonly provider: PaymentProvider;

  constructor(provider: PaymentProvider = "stripe") {
    this.provider = provider;
  }

  async authorize(
    request: PaymentRequest
  ): Promise<PaymentResult> {
    const amountMinor = Math.round(request.amount * 100);

    if (this.provider === "stripe") {
      const response = await new StripeClient().createCharge({
        id: request.paymentToken,
        amount: amountMinor,
        currency: request.currency,
        metadata: { orderId: request.orderId },
      });

      return {
        status: normalizePaymentStatus("stripe", response.state),
      };
    }

    const response = await new TrainingPaymentClient().authorize({
      token: request.paymentToken,
      amountMinor,
      currency: request.currency,
    });

    return {
      status: normalizePaymentStatus("training", response.outcome),
    };
  }
}