import "@testing-library/jest-dom";     
import { afterEach, beforeAll, vi } from "vitest";


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


beforeAll(() => {
  if (!globalThis.fetch) {
    // mock básico que pode ser trocado por vi.spyOn(global, 'fetch') nos testes
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ items: [], total_count: 0, incomplete_results: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }) as unknown as Promise<Response>
    );
  }
});

afterEach(() => {
  vi.useRealTimers();     
});