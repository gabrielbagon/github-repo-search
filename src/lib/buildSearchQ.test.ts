import { describe, it, expect } from "vitest";
import { buildSearchQ } from "@/lib/buildSearchQ";

describe("buildSearchQ", () => {
  it("termo + linguagem", () => {
    expect(buildSearchQ("react", "TypeScript"))
      .toBe("react in:name language:TypeScript");
  });

  it("apenas termo", () => {
    expect(buildSearchQ("next", ""))
      .toBe("next in:name");
  });

  it("apenas linguagem", () => {
    expect(buildSearchQ("", "Python"))
      .toBe("stars:>5000 language:Python");
  });

  it("trata espaços em branco", () => {
    expect(buildSearchQ("  react   ", "  TypeScript "))
      .toBe("react in:name language:TypeScript");
  });
});
