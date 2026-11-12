import { database } from "../database.ts";
import type { CartLine } from "../shared/calculateTotal.ts";
import { InventoryService } from "../inventory/index.ts";
import {
  PaymentService,
  type PaymentRequest,
} from "../payments/index.ts";

export class OrderService {
  private readonly payments: Pick<PaymentService, "authorize">;
  private readonly inventory: InventoryService;

  constructor(
    payments: Pick<PaymentService, "authorize"> = new PaymentService(),
    inventory: InventoryService = new InventoryService()
  ) {
    this.payments = payments;
    this.inventory = inventory;
  }

  async placeOrder(
    orderId: string,
    lines: readonly CartLine[],
    total: number,
    payment: Pick<PaymentRequest, "paymentToken" | "currency">
  ) {
    // Резервування повністю належить Inventory.
    this.inventory.reserve(lines);

    database.orders.set(orderId, {
      id: orderId,
      status: "created",
      total,
    });

    // Orders знає лише публічний контракт Payments.
    const result = await this.payments.authorize({
      orderId,
      paymentToken: payment.paymentToken,
      amount: total,
      currency: payment.currency,
    });

    const order = database.orders.get(orderId)!;

    order.paymentStatus = result.status;

    order.status =
      result.status === "paid"
        ? "confirmed"
        : "payment_pending";

    return { ...order };
  }
}