import "@testing-library/jest-dom";
import { afterEach, beforeAll, vi } from "vitest";

// Mocks básicos de APIs do browser que alguns componentes podem usar
Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// fetch default mock (pode ser sobrescrito por teste com vi.spyOn(global, 'fetch'))
beforeAll(() => {
  if (!globalThis.fetch) {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ items: [], total_count: 0, incomplete_results: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ) as unknown as Promise<Response>
    );
  }
});

afterEach(() => {
  vi.useRealTimers();
});
