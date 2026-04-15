export interface Claim {
  name: string;
  fraction: number; // 1, 0.5, 0.333, 0.25
}

export interface ReceiptItem {
  id: number;
  name: string;
  price: number;
  claims: Claim[];
}

export interface Receipt {
  id: string;
  payerName: string;
  payerVenmo: string;
  description?: string;
  items: ReceiptItem[];
  tax: number;
  tip: number;
  subtotal: number;
  total: number;
  createdAt: string;
  paidBy?: string[]; // names of people who marked as paid
}

export function claimedFraction(item: ReceiptItem): number {
  return item.claims.reduce((sum, c) => sum + c.fraction, 0);
}

export function remainingFraction(item: ReceiptItem): number {
  return Math.max(0, 1 - claimedFraction(item));
}

export function isFullyClaimed(item: ReceiptItem): boolean {
  return claimedFraction(item) >= 0.999; // floating point tolerance
}

export function getClaimByName(item: ReceiptItem, name: string): Claim | undefined {
  return item.claims.find((c) => c.name === name);
}

export function calculateShare(
  items: ReceiptItem[],
  name: string,
  subtotal: number,
  tax: number,
  tip: number
): { itemsTotal: number; taxShare: number; tipShare: number; total: number } {
  let itemsTotal = 0;
  for (const item of items) {
    const claim = getClaimByName(item, name);
    if (claim) {
      itemsTotal += item.price * claim.fraction;
    }
  }

  // Proportional tax and tip
  const proportion = subtotal > 0 ? itemsTotal / subtotal : 0;
  const taxShare = ceilCents(tax * proportion);
  const tipShare = ceilCents(tip * proportion);
  const total = ceilCents(itemsTotal + taxShare + tipShare);

  return { itemsTotal: ceilCents(itemsTotal), taxShare, tipShare, total };
}

export function ceilCents(value: number): number {
  return Math.ceil(value * 100 - 0.0001) / 100;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function fractionLabel(fraction: number): string {
  if (Math.abs(fraction - 1) < 0.01) return "Full";
  for (let n = 2; n <= 99; n++) {
    if (Math.abs(fraction - 1 / n) < 0.001) return `1/${n}`;
  }
  return `${Math.round(fraction * 100)}%`;
}
