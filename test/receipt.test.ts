import { describe, it, expect } from "vitest";
import {
  calculateShare,
  claimedFraction,
  remainingFraction,
  isFullyClaimed,
  ceilCents,
  formatCurrency,
  fractionLabel,
} from "@/lib/receipt";
import type { ReceiptItem } from "@/lib/receipt";

describe("ceilCents", () => {
  it("rounds up to nearest cent", () => {
    expect(ceilCents(1.001)).toBe(1.01);
    expect(ceilCents(1.009)).toBe(1.01);
  });

  it("does not round exact cents", () => {
    expect(ceilCents(1.5)).toBe(1.5);
    expect(ceilCents(10.0)).toBe(10.0);
  });
});

describe("formatCurrency", () => {
  it("formats with dollar sign and two decimals", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(100)).toBe("$100.00");
  });
});

describe("fractionLabel", () => {
  it("returns Full for 1", () => {
    expect(fractionLabel(1)).toBe("Full");
  });

  it("returns 1/N for common fractions", () => {
    expect(fractionLabel(0.5)).toBe("1/2");
    expect(fractionLabel(1 / 3)).toBe("1/3");
    expect(fractionLabel(0.25)).toBe("1/4");
  });
});

describe("claimedFraction / remainingFraction / isFullyClaimed", () => {
  it("returns 0 for unclaimed item", () => {
    const item: ReceiptItem = { id: 0, name: "Beer", price: 8, claims: [] };
    expect(claimedFraction(item)).toBe(0);
    expect(remainingFraction(item)).toBe(1);
    expect(isFullyClaimed(item)).toBe(false);
  });

  it("returns correct values for partially claimed item", () => {
    const item: ReceiptItem = {
      id: 0,
      name: "Pizza",
      price: 20,
      claims: [{ name: "Alice", fraction: 0.5 }],
    };
    expect(claimedFraction(item)).toBe(0.5);
    expect(remainingFraction(item)).toBe(0.5);
    expect(isFullyClaimed(item)).toBe(false);
  });

  it("returns fully claimed for item with fraction summing to 1", () => {
    const item: ReceiptItem = {
      id: 0,
      name: "Nachos",
      price: 15,
      claims: [
        { name: "Alice", fraction: 0.5 },
        { name: "Bob", fraction: 0.5 },
      ],
    };
    expect(isFullyClaimed(item)).toBe(true);
  });
});

describe("calculateShare", () => {
  it("calculates proportional tax and tip", () => {
    const items: ReceiptItem[] = [
      { id: 0, name: "Burger", price: 10, claims: [{ name: "Alice", fraction: 1 }] },
      { id: 1, name: "Salad", price: 10, claims: [{ name: "Bob", fraction: 1 }] },
    ];
    const share = calculateShare(items, "Alice", 20, 2, 4);
    expect(share.itemsTotal).toBe(10);
    expect(share.taxShare).toBe(1);
    expect(share.tipShare).toBe(2);
    expect(share.total).toBe(13);
  });

  it("returns zero for unclaimed user", () => {
    const items: ReceiptItem[] = [
      { id: 0, name: "Steak", price: 30, claims: [{ name: "Alice", fraction: 1 }] },
    ];
    const share = calculateShare(items, "Bob", 30, 3, 6);
    expect(share.itemsTotal + 0).toBe(0);
    expect(share.total + 0).toBe(0);
  });

  it("handles partial claims correctly", () => {
    const items: ReceiptItem[] = [
      {
        id: 0,
        name: "Wine",
        price: 20,
        claims: [
          { name: "Alice", fraction: 0.5 },
          { name: "Bob", fraction: 0.5 },
        ],
      },
    ];
    const share = calculateShare(items, "Alice", 20, 2, 4);
    expect(share.itemsTotal).toBe(10);
    expect(share.taxShare).toBe(1);
    expect(share.tipShare).toBe(2);
    expect(share.total).toBe(13);
  });
});
