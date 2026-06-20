import { describe, expect, it } from "vitest";
import { generateRefCode, isValidEmail, normalizeEmail } from "./waitlist";

describe("generateRefCode", () => {
  it("returns a code of the requested length", () => {
    expect(generateRefCode()).toHaveLength(7);
    expect(generateRefCode(10)).toHaveLength(10);
  });

  it("uses only unambiguous uppercase characters (no 0/O/1/I)", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateRefCode(12)).toMatch(/^[A-HJ-NP-Z2-9]+$/);
    }
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("trader@tradenotti.app")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["", "nope", "a@b", "a@b.", "@b.com", "a b@c.com"]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });
});

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Trader@TradeNotti.APP ")).toBe("trader@tradenotti.app");
  });
});
