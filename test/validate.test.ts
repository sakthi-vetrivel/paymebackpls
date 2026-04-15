import { describe, it, expect } from "vitest";
import {
  isValidVenmoHandle,
  isValidPrice,
  isValidFraction,
  isValidImageType,
  isValidImageSize,
} from "@/lib/validate";

describe("isValidVenmoHandle", () => {
  it("accepts valid handles", () => {
    expect(isValidVenmoHandle("@alex-smith")).toBe(true);
    expect(isValidVenmoHandle("@a")).toBe(true);
    expect(isValidVenmoHandle("@user.name_123")).toBe(true);
  });

  it("rejects invalid handles", () => {
    expect(isValidVenmoHandle("alex")).toBe(false);
    expect(isValidVenmoHandle("@")).toBe(false);
    expect(isValidVenmoHandle("")).toBe(false);
    expect(isValidVenmoHandle("@" + "a".repeat(51))).toBe(false);
  });
});

describe("isValidPrice", () => {
  it("accepts valid prices", () => {
    expect(isValidPrice(0)).toBe(true);
    expect(isValidPrice(12.99)).toBe(true);
    expect(isValidPrice(0.01)).toBe(true);
  });

  it("rejects invalid prices", () => {
    expect(isValidPrice(-1)).toBe(false);
    expect(isValidPrice(NaN)).toBe(false);
    expect(isValidPrice(Infinity)).toBe(false);
  });
});

describe("isValidFraction", () => {
  it("accepts valid fractions", () => {
    expect(isValidFraction(0)).toBe(true);
    expect(isValidFraction(0.5)).toBe(true);
    expect(isValidFraction(1)).toBe(true);
  });

  it("rejects invalid fractions", () => {
    expect(isValidFraction(-0.1)).toBe(false);
    expect(isValidFraction(1.1)).toBe(false);
    expect(isValidFraction(NaN)).toBe(false);
  });
});

describe("isValidImageType", () => {
  it("accepts jpeg, png, webp", () => {
    expect(isValidImageType("image/jpeg")).toBe(true);
    expect(isValidImageType("image/png")).toBe(true);
    expect(isValidImageType("image/webp")).toBe(true);
  });

  it("rejects other types", () => {
    expect(isValidImageType("image/gif")).toBe(false);
    expect(isValidImageType("application/pdf")).toBe(false);
    expect(isValidImageType("text/plain")).toBe(false);
  });
});

describe("isValidImageSize", () => {
  it("accepts valid sizes", () => {
    expect(isValidImageSize(1)).toBe(true);
    expect(isValidImageSize(5 * 1024 * 1024)).toBe(true);
    expect(isValidImageSize(10 * 1024 * 1024)).toBe(true);
  });

  it("rejects invalid sizes", () => {
    expect(isValidImageSize(0)).toBe(false);
    expect(isValidImageSize(10 * 1024 * 1024 + 1)).toBe(false);
    expect(isValidImageSize(-1)).toBe(false);
  });
});
