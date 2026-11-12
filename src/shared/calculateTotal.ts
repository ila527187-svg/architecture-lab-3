export type CartLine = Readonly<{
  productId: string;
  unitPrice: number;
  quantity: number;
  lineTotal?: number;
}>;

export type PricingOptions = Readonly<{
  taxRate: number;
  discountPercent: number;
}>;

export function calculateTotal(
  lines: readonly CartLine[],
  options: PricingOptions
): number {
  let subtotal = 0;

  for (const line of lines) {
    subtotal += line.unitPrice * line.quantity;
  }

  const discounted =
    subtotal * (1 - options.discountPercent / 100);

  return Number(
    (discounted * (1 + options.taxRate)).toFixed(2)
  );
}