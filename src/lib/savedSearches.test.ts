import { renderHook, act } from "@testing-library/react";
import { useSavedSearches } from "./savedSearches";

describe("useSavedSearches", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("adds and removes a saved search", () => {
    const { result } = renderHook(() => useSavedSearches());

    // no início pode estar vazio até hidratar; forçamos um tick
    act(() => {});

    act(() => {
      result.current.add({
        q: "react",
        language: "",
        sort: "best",
        order: "desc",
        perPage: 10,
      });
    });

    expect(
      result.current.isSavedFor({ q: "react", language: "", sort: "best", order: "desc", perPage: 10 })
    ).toBe(true);

    const id = "react||best|desc|10";
    act(() => {
      result.current.remove(id);
    });

    expect(
      result.current.isSavedFor({ q: "react", language: "", sort: "best", order: "desc", perPage: 10 })
    ).toBe(false);
  });
});
