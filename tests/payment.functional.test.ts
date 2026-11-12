import test from "node:test";
import assert from "node:assert/strict";

import { CheckoutController } from "../src/checkout/CheckoutController.ts";
import { OrderService } from "../src/orders/OrderService.ts";
import { PaymentService } from "../src/payments/index.ts";
import { database, resetDatabase } from "../src/database.ts";
import { runtimeConfig } from "../src/config.ts";

test.beforeEach(() => {
  resetDatabase();

  runtimeConfig.taxRate = 0.2;
  runtimeConfig.discountPercent = 0;

  database.stock.set("book", {
    productId: "book",
    available: 5,
  });
});

const request = (orderId: string, paymentToken: string) => ({
  orderId,
  paymentToken,
  currency: "UAH",
  lines: [
    { productId: "book", unitPrice: 100, quantity: 1 },
  ],
});

const trainingCheckout = () =>
  new CheckoutController(
    new OrderService(new PaymentService("training"))
  );

test("training provider paid keeps Checkout response", async () => {
  const response = await trainingCheckout().checkout(
    request("training-paid", "training_paid_ok")
  );

  assert.deepEqual(response, {
    orderId: "training-paid",
    status: "confirmed",
    total: 120,
    paymentStatus: "paid",
  });
});

test("training provider supports processing", async () => {
  const response = await trainingCheckout().checkout(
    request("training-processing", "training_processing_1")
  );

  assert.deepEqual(response, {
    orderId: "training-processing",
    status: "payment_pending",
    total: 120,
    paymentStatus: "processing",
  });
});

test("training provider handles failed payments", async () => {
  const response = await trainingCheckout().checkout(
    request("training-failed", "training_fail_1")
  );

  assert.deepEqual(response, {
    orderId: "training-failed",
    status: "payment_pending",
    total: 120,
    paymentStatus: "failed",
  });
});

test("Stripe also supports processing", async () => {
  const response = await new CheckoutController().checkout(
    request("stripe-processing", "processing_user_action")
  );

  assert.deepEqual(response, {
    orderId: "stripe-processing",
    status: "payment_pending",
    total: 120,
    paymentStatus: "processing",
  });
});