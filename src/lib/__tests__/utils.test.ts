import { describe, expect, it } from "vitest";

import { formatCurrency, getInitials } from "../utils";

describe("getInitials", () => {
  it("returns initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for a single word", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("handles multiple spaces between words", () => {
    expect(getInitials("John  Doe")).toBe("JD");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("uppercases the initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("handles three-word names", () => {
    expect(getInitials("John Michael Doe")).toBe("JMD");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("formats EUR when specified", () => {
    expect(formatCurrency(1000, { currency: "EUR", locale: "fr-FR" })).toContain("1");
  });

  it("removes decimals when noDecimals is true", () => {
    expect(formatCurrency(1000, { noDecimals: true })).toBe("$1,000");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });
});
