import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Home from "@/app/page";
import { __setFeatureForTests } from "@/config";

function makeResponse(items: any[], total = 42) {
  return new Response(JSON.stringify({
    total_count: total,
    incomplete_results: false,
    items,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  // mock fetch limpo a cada teste
  (global.fetch as any) = vi.fn(async () =>
    makeResponse([
      {
        id: 1,
        full_name: "acme/widgets",
        description: "repo de teste",
        stargazers_count: 123,
        html_url: "https://github.com/acme/widgets",
        updated_at: "2024-01-02T03:04:05Z",
        owner: { login: "acme", avatar_url: "https://example.com/avatar.png" },
      },
    ])
  );
  // reset URL
  window.history.replaceState(null, "", "/");
});

describe("Home page", () => {
  it("renderiza resultados do fetch e atualiza URL ao buscar", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // exibe item inicial (placeholder)
    expect(await screen.findByText("acme/widgets")).toBeInTheDocument();

    // digita busca
    const input = screen.getByLabelText(/buscar repositórios/i);
    await user.type(input, "react");

    // aguarda debounce + novo fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // inicial + após digitar
    });

    // URL deve conter q=react (replaceState)
    expect(window.location.search).toContain("q=react");
  });

  it("filtra por linguagem e reseta para página 1", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // muda linguagem
    await user.selectOptions(screen.getByLabelText(/linguagem/i), "TypeScript");

    // espera novo fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // URL contem lang=TypeScript e page=1 (implícito; não precisa aparecer)
    expect(window.location.search).toContain("lang=TypeScript");
  });

  it("paginação com botão Próxima →", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // primeiro fetch
    expect(await screen.findByText("acme/widgets")).toBeInTheDocument();

    // clica Próxima
    await user.click(screen.getByRole("button", { name: /próxima página/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // URL deve conter page=2
    expect(window.location.search).toContain("page=2");
  });
 it("envia Authorization: Bearer quando PAT está salvo", async () => {
		__setFeatureForTests("PAT", true); // ← liga a flag só para este teste

		localStorage.setItem("gh:pat", "github_pat_TESTE1234567890");

		const spy = vi.spyOn(global, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					total_count: 1,
					incomplete_results: false,
					items: [
						{
							id: 1,
							full_name: "acme/widgets",
							description: "repo de teste",
							stargazers_count: 1,
							html_url: "https://github.com/acme/widgets",
							updated_at: "2024-01-02T03:04:05Z",
							owner: { login: "acme", avatar_url: "https://example.com/a.png" },
						},
					],
				}),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"x-ratelimit-limit": "30",
						"x-ratelimit-remaining": "29",
						"x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 60),
					},
				}
			) as unknown as Response
		);

		const { default: Home } = await import("@/app/page");
		render(<Home />);

		await screen.findByText("acme/widgets");
		expect(spy).toHaveBeenCalled();
		const [, opts] = spy.mock.calls[0];
		expect((opts as any).headers.Authorization).toBe(
			"Bearer github_pat_TESTE1234567890"
		);
 });

});
