import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

function Demo() {
  const [v, setV] = useState("");
  const debounced = useDebouncedValue(v, 300);
  return (
    <>
      <input
        aria-label="input"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
      <div aria-label="debounced">{debounced}</div>
    </>
  );
}

describe("useDebouncedValue", () => {
  it("atualiza o valor apenas após o delay", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<Demo />);
    await user.type(screen.getByLabelText("input"), "abc");

    // antes do delay
    expect(screen.getByLabelText("debounced").textContent).toBe("");

    // avança o relógio
    vi.advanceTimersByTime(299);
    expect(screen.getByLabelText("debounced").textContent).toBe("");

    vi.advanceTimersByTime(1);
    expect(screen.getByLabelText("debounced").textContent).toBe("abc");
  });
});
