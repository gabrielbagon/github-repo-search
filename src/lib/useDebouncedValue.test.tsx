import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

describe("useDebouncedValue", () => {
  it("atualiza o valor apenas após o delay", async () => {
    vi.useFakeTimers(); // usar timers falsos ANTES de renderizar o hook

    // renderiza o hook com valor inicial ""
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
      { initialProps: { value: "", delay: 300 } }
    );

    // estado inicial é o valor imediatamente disponível
    expect(result.current).toBe("");

    // altera o valor para "abc"
    rerender({ value: "abc", delay: 300 });

    // antes do delay terminar, nada muda
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("");

    // após o prazo completo, atualiza
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("abc");
  });

  it("reinicia o timer quando o valor muda durante o debounce", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
      { initialProps: { value: "", delay: 200 } }
    );

    // muda para "a", quase estoura o tempo...
    rerender({ value: "a", delay: 200 });
    act(() => vi.advanceTimersByTime(150));

    // ...muda para "ab" antes do fim — reinicia o timer
    rerender({ value: "ab", delay: 200 });
    act(() => vi.advanceTimersByTime(150));
    expect(result.current).toBe(""); // ainda não atualizou

    // agora completa o novo prazo
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe("ab");
  })
});