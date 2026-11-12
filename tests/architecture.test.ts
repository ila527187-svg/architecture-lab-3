import test from "node:test";
import assert from "node:assert/strict";

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = fileURLToPath(
  new URL("../src/", import.meta.url)
);

function collect(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(
    entry => {
      const name = join(dir, entry.name);

      return entry.isDirectory()
        ? collect(name)
        : entry.name.endsWith(".ts")
          ? [name]
          : [];
    }
  );
}

test("only Payments imports payments/internal", () => {
  for (const file of collect(sourceDir)) {
    const path = relative(sourceDir, file).replaceAll("\\", "/");

    if (path.startsWith("payments/")) continue;

    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /from\s+["'][^"']*payments\/internal\//,
      path
    );
  }
});

test("Payments cannot depend on Orders", () => {
  for (const file of collect(join(sourceDir, "payments"))) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /orders\/internal|from\s+["'][^"']*orders\//,
      file
    );
  }
});

test("Orders cannot change raw stock", () => {
  for (const file of collect(join(sourceDir, "orders"))) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /database\.stock/,
      file
    );
  }
});

test("calculateTotal cannot use global config", () => {
  const source = readFileSync(
    join(sourceDir, "shared", "calculateTotal.ts"),
    "utf8"
  );

  assert.doesNotMatch(
    source,
    /from\s+["'][^"']*config\.ts/
  );

  assert.doesNotMatch(
    source,
    /auditLog|runtimeConfig/
  );
});