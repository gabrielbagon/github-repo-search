import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { Controls } from "@/components/Controls";

describe("Controls", () => {
  it("permite digitar busca e trocar linguagem/sort", async () => {
    const user = userEvent.setup();

    const setQuery = vi.fn();
    const setLanguage = vi.fn();
    const setSort = vi.fn();
    const setOrder = vi.fn();
    const setPerPage = vi.fn();

    // ⬇️ render inicial (sort = "best")
    const { rerender } = render(
      <Controls
        query=""
        setQuery={setQuery}
        sort="best"
        setSort={setSort}
        order="desc"
        setOrder={setOrder}
        perPage={10}
        setPerPage={setPerPage}
        language=""
        setLanguage={setLanguage}
      />
    );

    await user.type(screen.getByLabelText(/buscar repositórios/i), "react");
    expect(setQuery).toHaveBeenCalled();

    await user.selectOptions(screen.getByLabelText(/linguagem/i), "TypeScript");
    expect(setLanguage).toHaveBeenCalledWith("TypeScript");

    
    await user.selectOptions(screen.getByLabelText(/ordenar/i), "stars");
    expect(setSort).toHaveBeenCalledWith("stars");

    
    rerender(
      <Controls
        query=""
        setQuery={setQuery}
        sort="stars"           
        setSort={setSort}
        order="desc"
        setOrder={setOrder}
        perPage={10}
        setPerPage={setPerPage}
        language="TypeScript"
        setLanguage={setLanguage}
      />
    );

    
    await user.selectOptions(screen.getByLabelText(/ordem/i), "asc");
    expect(setOrder).toHaveBeenCalledWith("asc");
  });
});
