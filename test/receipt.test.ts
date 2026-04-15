import { describe, it, expect } from "vitest";
import {
  claimedFraction,
  remainingFraction,
  isFullyClaimed,
  getClaimByName,
  calculateShare,
  ceilCents,
  formatCurrency,
  fractionLabel,
  type ReceiptItem,
} from "@/lib/receipt";

function makeItem(claims: { name: string; fraction: number }[] = []): ReceiptItem {
  return { id: 1, name: "Burger", price: 10, claims };
}

describe("claimedFraction", () => {
  it("returns 0 for no claims", () => {
    expect(claimedFraction(makeItem())).toBe(0);
  });

  it("sums all claim fractions", () => {
    expect(claimedFraction(makeItem([
      { name: "A", fraction: 0.5 },
      { name: "B", fraction: 0.5 },
    ]))).toBe(1);
  });
});

describe("remainingFraction", () => {
  it("returns 1 for unclaimed item", () => {
    expect(remainingFraction(makeItem())).toBe(1);
  });

  it("returns 0 for fully claimed item", () => {
    expect(remainingFraction(makeItem([{ name: "A", fraction: 1 }]))).toBe(0);
  });

  it("floors at 0 for overclaimed items", () => {
    expect(remainingFraction(makeItem([
      { name: "A", fraction: 0.5 },
      { name: "B", fraction: 0.6 },
    ]))).toBe(0);
  });
});

describe("isFullyClaimed", () => {
  it("returns false for unclaimed", () => {
    expect(isFullyClaimed(makeItem())).toBe(false);
  });

  it("returns true at 1.0", () => {
    expect(isFullyClaimed(makeItem([{ name: "A", fraction: 1 }]))).toBe(true);
  });

  it("handles floating point near 1.0", () => {
    expect(isFullyClaimed(makeItem([
      { name: "A", fraction: 1 / 3 },
      { name: "B", fraction: 1 / 3 },
      { name: "C", fraction: 1 / 3 },
    ]))).toBe(true);
  });
});

describe("getClaimByName", () => {
  it("finds existing claim", () => {
    const item = makeItem([{ name: "Alex", fraction: 0.5 }]);
    expect(getClaimByName(item, "Alex")).toEqual({ name: "Alex", fraction: 0.5 });
  });

  it("returns undefined for missing name", () => {
    expect(getClaimByName(makeItem(), "Nobody")).toBeUndefined();
  });
});

describe("calculateShare", () => {
  it("computes proportional tax and tip", () => {
    const items: ReceiptItem[] = [
      { id: 1, name: "Burger", price: 10, claims: [{ name: "Alex", fraction: 1 }] },
      { id: 2, name: "Fries", price: 5, claims: [{ name: "Sam", fraction: 1 }] },
    ];
    const result = calculateShare(items, "Alex", 15, 1.5, 3);
    // Alex has $10 of $15 subtotal = 2/3 proportion
    expect(result.itemsTotal).toBe(10);
    expect(result.taxShare).toBe(1); // ceil(1.5 * 2/3) = ceil(1.0) = 1.0
    expect(result.tipShare).toBe(2); // ceil(3 * 2/3) = ceil(2.0) = 2.0
    expect(result.total).toBe(13);
  });

  it("returns zero for unclaimed person", () => {
    const items: ReceiptItem[] = [
      { id: 1, name: "Burger", price: 10, claims: [{ name: "Alex", fraction: 1 }] },
    ];
    const result = calculateShare(items, "Nobody", 10, 1, 2);
    expect(result.total + 0).toBe(0); // ceilCents returns -0 for zero input
  });

  it("handles zero subtotal without dividing by zero", () => {
    const result = calculateShare([], "Alex", 0, 0, 0);
    expect(result.total + 0).toBe(0); // ceilCents returns -0 for zero input
  });
});

describe("ceilCents", () => {
  it("rounds up to nearest cent", () => {
    expect(ceilCents(1.001)).toBe(1.01);
    expect(ceilCents(1.999)).toBe(2.0);
  });

  it("keeps exact cents unchanged", () => {
    expect(ceilCents(1.5)).toBe(1.5);
  });
});

describe("formatCurrency", () => {
  it("formats with dollar sign and two decimals", () => {
    expect(formatCurrency(10)).toBe("$10.00");
    expect(formatCurrency(9.5)).toBe("$9.50");
  });
});

describe("fractionLabel", () => {
  it("returns Full for 1", () => {
    expect(fractionLabel(1)).toBe("Full");
  });

  it("returns 1/2 for 0.5", () => {
    expect(fractionLabel(0.5)).toBe("1/2");
  });

  it("returns 1/3 for third", () => {
    expect(fractionLabel(1 / 3)).toBe("1/3");
  });

  it("returns percentage for non-standard fractions", () => {
    expect(fractionLabel(0.15)).toBe("15%");
  });
});
