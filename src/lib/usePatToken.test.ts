import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePatToken, isLikelyGithubToken } from "@/lib/usePatToken";

describe("usePatToken", () => {
  it("persiste e limpa token no localStorage", () => {
    localStorage.clear();
    const { result } = renderHook(() => usePatToken());

    act(() => {
     result.current.save("github_pat_ABCDEF1234567890");
    });
    expect(localStorage.getItem("gh:pat")).toBe("github_pat_ABCDEF1234567890");
    expect(result.current.token).toBe("github_pat_ABCDEF1234567890");

    act(() => {
      result.current.clear();
    });
    expect(localStorage.getItem("gh:pat")).toBeNull();
    expect(result.current.token).toBe("");
  });

  it("valida formato provável de token", () => {
    expect(isLikelyGithubToken("github_pat_ABCDEF_1234567890_ABCDEFG")).toBe(true);
    expect(isLikelyGithubToken("ghp_abcdef1234567890abcdef1234567890")).toBe(true);
    expect(isLikelyGithubToken("foo")).toBe(false);
  });
});
