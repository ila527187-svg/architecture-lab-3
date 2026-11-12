import test from "node:test";
import assert from "node:assert/strict";

import { InventoryService } from "../src/inventory/index.ts";
import { CheckoutController } from "../src/checkout/CheckoutController.ts";
import { database, resetDatabase } from "../src/database.ts";

test.beforeEach(() => {
  resetDatabase();

  database.stock.set("book", {
    productId: "book",
    available: 5,
  });

  database.stock.set("pen", {
    productId: "pen",
    available: 1,
  });
});

test("out-of-stock never partially reserves stock", async () => {
  await assert.rejects(
    () =>
      new CheckoutController().checkout({
        orderId: "order-atomic",
        paymentToken: "tok_valid",
        currency: "UAH",
        lines: [
          { productId: "book", unitPrice: 50, quantity: 2 },
          { productId: "pen", unitPrice: 10, quantity: 2 },
        ],
      }),
    /Insufficient stock for pen/
  );

  assert.equal(database.stock.get("book")?.available, 5);
  assert.equal(database.stock.get("pen")?.available, 1);
  assert.equal(database.orders.has("order-atomic"), false);
});

test("repeated products cannot oversell", () => {
  assert.throws(
    () =>
      new InventoryService().reserve([
        { productId: "book", quantity: 3 },
        { productId: "book", quantity: 3 },
      ]),
    /Insufficient stock for book/
  );

  assert.equal(database.stock.get("book")?.available, 5);
});

test("invalid quantities are rejected", () => {
  const inventory = new InventoryService();

  assert.throws(
    () => inventory.reserve([
      { productId: "book", quantity: -1 },
    ]),
    /Invalid quantity/
  );

  assert.throws(
    () => inventory.reserve([
      { productId: "book", quantity: 0 },
    ]),
    /Invalid quantity/
  );

  assert.equal(database.stock.get("book")?.available, 5);
});

test("successful reservation updates all products", () => {
  new InventoryService().reserve([
    { productId: "book", quantity: 2 },
    { productId: "pen", quantity: 1 },
    { productId: "book", quantity: 1 },
  ]);

  assert.equal(database.stock.get("book")?.available, 2);
  assert.equal(database.stock.get("pen")?.available, 0);
});