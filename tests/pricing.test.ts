import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateTotal,
  type CartLine,
} from "../src/shared/calculateTotal.ts";

import { auditLog, runtimeConfig } from "../src/config.ts";

test("calculateTotal is deterministic", () => {
  const lines: CartLine[] = [
    { productId: "book", unitPrice: 100, quantity: 2 },
  ];

  const options = {
    taxRate: 0.2,
    discountPercent: 10,
  };

  const first = calculateTotal(lines, options);
  const oldTax = runtimeConfig.taxRate;
  const oldDiscount = runtimeConfig.discountPercent;

  try {
    runtimeConfig.taxRate = 0.99;
    runtimeConfig.discountPercent = 50;

    assert.equal(calculateTotal(lines, options), first);
    assert.equal(first, 216);

    assert.equal(
      calculateTotal(lines, {
        taxRate: 0,
        discountPercent: 0,
      }),
      200
    );
  } finally {
    runtimeConfig.taxRate = oldTax;
    runtimeConfig.discountPercent = oldDiscount;
  }
});

test("calculateTotal does not mutate lines or audit log", () => {
  const line = Object.freeze({
    productId: "book",
    unitPrice: 100,
    quantity: 2,
  });

  const lines: readonly CartLine[] = Object.freeze([line]);

  auditLog.length = 0;

  assert.equal(
    calculateTotal(lines, {
      taxRate: 0.2,
      discountPercent: 0,
    }),
    240
  );

  assert.deepEqual(line, {
    productId: "book",
    unitPrice: 100,
    quantity: 2,
  });

  assert.deepEqual(auditLog, []);
});

test("Checkout records audit outside calculateTotal", async () => {
  const { CheckoutController } = await import(
    "../src/checkout/CheckoutController.ts"
  );

  const { database, resetDatabase } = await import(
    "../src/database.ts"
  );

  resetDatabase();

  database.stock.set("book", {
    productId: "book",
    available: 5,
  });

  auditLog.length = 0;

  const result = await new CheckoutController().checkout({
    orderId: "audit-1",
    paymentToken: "tok_valid",
    currency: "UAH",
    lines: [
      { productId: "book", unitPrice: 100, quantity: 1 },
    ],
  });

  assert.deepEqual(auditLog, [
    `total_calculated:${result.total}`,
  ]);
});