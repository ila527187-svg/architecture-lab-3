import { database } from "../database.ts";

export type ReservationLine = Readonly<{
  productId: string;
  quantity: number;
}>;

export class InventoryService {
  reserve(lines: readonly ReservationLine[]): void {
    const requested = new Map<string, number>();

    // Спочатку перевіряємо всі кількості.
    for (const line of lines) {
      if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
        throw new Error(`Invalid quantity for ${line.productId}`);
      }

      const combined =
        (requested.get(line.productId) ?? 0) + line.quantity;

      if (!Number.isSafeInteger(combined)) {
        throw new Error(`Invalid quantity for ${line.productId}`);
      }

      requested.set(line.productId, combined);
    }

    // Перевіряємо всі залишки до будь-якого списання.
    for (const [productId, quantity] of requested) {
      const row = database.stock.get(productId);

      if (
        !row ||
        !Number.isSafeInteger(row.available) ||
        row.available < quantity
      ) {
        throw new Error(`Insufficient stock for ${productId}`);
      }
    }

    // Списуємо тільки після успішної перевірки всього кошика.
    for (const [productId, quantity] of requested) {
      const row = database.stock.get(productId)!;

      database.stock.set(productId, {
        ...row,
        available: row.available - quantity,
      });
    }
  }
}