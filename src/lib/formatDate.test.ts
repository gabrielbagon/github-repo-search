import { describe, it, expect } from "vitest";
import { formatDate } from "@/lib/formatDate";

describe("formatDate", () => {
  it("retorna string formatada", () => {
    const s = formatDate("2024-01-02T03:04:05Z");
    expect(typeof s).toBe("string");
    expect(s.length).toBeGreaterThan(0);
  });

  it("retorna original se inválido", () => {
    const s = formatDate("not-a-date");
    expect(s).toBe("not-a-date");
  });
});
