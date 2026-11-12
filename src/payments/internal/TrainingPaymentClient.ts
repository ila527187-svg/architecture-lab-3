type TrainingPayload = Readonly<{
  token: string;
  amountMinor: number;
  currency: string;
}>;

type TrainingResponse = Readonly<{
  outcome: "approved" | "queued" | "rejected";
}>;

export class TrainingPaymentClient {
  async authorize(
    payload: TrainingPayload
  ): Promise<TrainingResponse> {
    if (payload.token.startsWith("training_fail_")) {
      return { outcome: "rejected" };
    }

    if (payload.token.startsWith("training_processing_")) {
      return { outcome: "queued" };
    }

    return { outcome: "approved" };
  }
}