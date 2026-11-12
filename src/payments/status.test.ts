
import test from "node:test";
import assert from "node:assert/strict";
import { normalizePaymentStatus } from "./internal/normalizePaymentStatus.ts";

test("Payments maps successful status to paid", () => {
  assert.equal(
    normalizePaymentStatus("stripe", "succeeded"),
    "paid"
  );
});

test("Payments maps pending status to processing", () => {
  assert.equal(
    normalizePaymentStatus("stripe", "requires_action"),
    "processing"
  );
});

test("Payments maps declined status to failed", () => {
  assert.equal(
    normalizePaymentStatus("stripe", "declined"),
    "failed"
  );
});

test("Unknown status is treated as failed", () => {
  assert.equal(
    normalizePaymentStatus("stripe", "unexpected_new_state"),
    "failed"
  );
});
test("Training provider states normalize inside Payments", () => {
  assert.equal(
    normalizePaymentStatus("training", "approved"),
    "paid"
  );

  assert.equal(
    normalizePaymentStatus("training", "queued"),
    "processing"
  );

  assert.equal(
    normalizePaymentStatus("training", "rejected"),
    "failed"
  );

  assert.equal(
    normalizePaymentStatus("training", "brand_new_state"),
    "failed"
  );
});