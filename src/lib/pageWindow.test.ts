import { describe, it, expect } from "vitest";
import { pageWindow } from "@/lib/pageWindow";

describe("pageWindow", () => {
  it("janela no meio", () => {
    expect(pageWindow(5, 10, 2)).toEqual([3,4,5,6,7]);
  });

  it("perto do início", () => {
    expect(pageWindow(1, 3, 2)).toEqual([1,2,3]);
  });

  it("perto do fim", () => {
    expect(pageWindow(9, 10, 2)).toEqual([7,8,9,10]);
  });
});
