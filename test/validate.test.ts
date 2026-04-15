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
    expect(isValidVenmoHandle("@alex")).toBe(true);
    expect(isValidVenmoHandle("@user.name-123")).toBe(true);
  });

  it("rejects handles without @", () => {
    expect(isValidVenmoHandle("alex")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidVenmoHandle("")).toBe(false);
  });

  it("rejects handles over 50 chars", () => {
    expect(isValidVenmoHandle("@" + "a".repeat(51))).toBe(false);
  });
});

describe("isValidPrice", () => {
  it("accepts zero and positive numbers", () => {
    expect(isValidPrice(0)).toBe(true);
    expect(isValidPrice(9.99)).toBe(true);
  });

  it("rejects negative numbers", () => {
    expect(isValidPrice(-1)).toBe(false);
  });

  it("rejects NaN and Infinity", () => {
    expect(isValidPrice(NaN)).toBe(false);
    expect(isValidPrice(Infinity)).toBe(false);
  });
});

describe("isValidFraction", () => {
  it("accepts values between 0 and 1", () => {
    expect(isValidFraction(0)).toBe(true);
    expect(isValidFraction(0.5)).toBe(true);
    expect(isValidFraction(1)).toBe(true);
  });

  it("rejects values outside 0-1", () => {
    expect(isValidFraction(-0.1)).toBe(false);
    expect(isValidFraction(1.1)).toBe(false);
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
    expect(isValidImageType("text/plain")).toBe(false);
  });
});

describe("isValidImageSize", () => {
  it("accepts sizes up to 10MB", () => {
    expect(isValidImageSize(1)).toBe(true);
    expect(isValidImageSize(10 * 1024 * 1024)).toBe(true);
  });

  it("rejects zero, negative, and over 10MB", () => {
    expect(isValidImageSize(0)).toBe(false);
    expect(isValidImageSize(-1)).toBe(false);
    expect(isValidImageSize(10 * 1024 * 1024 + 1)).toBe(false);
  });
});
