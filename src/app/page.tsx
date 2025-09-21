"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
} from "react";
import { buildSearchQ } from "@/lib/buildSearchQ";
import { pageWindow } from "@/lib/pageWindow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { Repo, SearchResponse } from "@/types/github";
import { RepoCard } from "@/components/RepoCard";
import { Controls } from "@/components/Controls";
import type { ControlsHandle } from "@/components/Controls";
import { FEATURES } from "@/config";
import { PatControl } from "@/components/PatControl";
import { usePatToken } from "@/lib/usePatToken";
import { clampPrefs, readPrefs, writePrefs } from "@/lib/prefs";

// Valores aceitos (para validação quando hidratamos pela URL)
const ALLOWED_SORT = new Set(["best", "stars", "updated"] as const);
const ALLOWED_ORDER = new Set(["asc", "desc"] as const);
const ALLOWED_PER_PAGE = [10, 20, 30, 50, 100] as const;

export default function Home() {
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const controlsRef = useRef<ControlsHandle | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // UI State
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 500);
  const [sort, setSort] = useState<"best" | "stars" | "updated">("best");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<string>("");

  // Hidratação (somente após ler URL/localStorage)
  const [hydrated, setHydrated] = useState(false);

  // Dados e estados de rede
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate-limit (opcional – útil pra feedback ao usuário)
  const [rate, setRate] = useState<{ limit?: number; remaining?: number; reset?: number }>({});

  // Token (apenas usado se a feature estiver ligada)
  const { token } = usePatToken();
  const tokenUsed = FEATURES.PAT ? token : "";

  // --------------------------------------------
  // Hidratar estado via URL + localStorage (1x)
  // --------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);
    const stored = readPrefs(); // prefs do localStorage

    // Preferência: URL > localStorage > defaults (clampPrefs valida)
    const clamped = clampPrefs({
      sort: (sp.get("sort") ?? stored.sort) as any,
      order: (sp.get("order") ?? stored.order) as any,
      perPage: Number(sp.get("per_page") ?? stored.perPage),
      language: (sp.get("lang") ?? stored.language) || "",
    });

    const q = sp.get("q") ?? "";
    const pg = Number(sp.get("page") ?? 1);

    setQuery(q);
    setSort(ALLOWED_SORT.has(clamped.sort) ? clamped.sort : "best");
    setOrder(ALLOWED_ORDER.has(clamped.order) ? clamped.order : "desc");
    setPerPage(ALLOWED_PER_PAGE.includes(clamped.perPage as any) ? clamped.perPage : 10);
    setLanguage(clamped.language);
    setPage(Number.isFinite(pg) && pg >= 1 ? pg : 1);

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistir preferências quando mudarem (exceto query/page)
  useEffect(() => {
    if (!hydrated) return;
    writePrefs({ sort, order, perPage, language });
  }, [sort, order, perPage, language, hydrated]);

  // Resetar página quando filtros mudam (após hidratar)
  useEffect(() => {
    if (!hydrated) return;
    setPage(1);
  }, [debouncedQuery, perPage, sort, order, language, hydrated]);

  // --------------------------------------------
  // Sincronizar a URL (replaceState) com o estado
  // --------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;

    const sp = new URLSearchParams();
    if (debouncedQuery) sp.set("q", debouncedQuery);
    if (sort !== "best") {
      sp.set("sort", sort);
      sp.set("order", order);
    }
    if (perPage !== 10) sp.set("per_page", String(perPage));
    if (page !== 1) sp.set("page", String(page));
    if (language) sp.set("lang", language);

    const next = sp.toString();
    const target = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    const current = window.location.pathname + window.location.search;

    if (target !== current) {
      history.replaceState(null, "", target);
    }
  }, [debouncedQuery, sort, order, perPage, page, language, hydrated]);

  // --------------------------------------------
  // Construir a URL de busca da API (memo)
  // --------------------------------------------
  const requestUrl = useMemo(() => {
    const q = buildSearchQ(debouncedQuery, language);
    const params = new URLSearchParams();
    params.set("q", q);
    if (sort !== "best") {
      params.set("sort", sort);
      params.set("order", order);
    }
    params.set("per_page", String(perPage));
    params.set("page", String(page));
    return `https://api.github.com/search/repositories?${params.toString()}`;
  }, [debouncedQuery, language, sort, order, perPage, page]);

  // --------------------------------------------
  // Fetch com cancelamento + captura de rate-limit
  // --------------------------------------------
  useEffect(() => {
    if (!hydrated) return;

    setError(null);
    setLoading(true);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (tokenUsed) headers.Authorization = `Bearer ${tokenUsed}`;

    fetch(requestUrl, { signal: controller.signal, headers })
      .then(async (res) => {
        // rate headers
        const limit = Number(res.headers.get("x-ratelimit-limit") ?? "");
        const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? "");
        const reset = Number(res.headers.get("x-ratelimit-reset") ?? "");
        setRate({
          limit: isFinite(limit) ? limit : undefined,
          remaining: isFinite(remaining) ? remaining : undefined,
          reset: isFinite(reset) ? reset : undefined,
        });

        if (res.status === 403) {
          let details = "";
          if (remaining === 0 && reset) {
            const when = new Date(reset * 1000);
            details = ` — limite reinicia em ${when.toLocaleString("pt-BR")}`;
          }
          throw new Error(`Limite da Search API atingido${details}.`);
        }
        if (!res.ok) throw new Error(`Erro ${res.status}: ${res.statusText}`);
        const json = (await res.json()) as SearchResponse;
        return json;
      })
      .then((json) => setData(json))
      .catch((err) => {
        if ((err as any).name !== "AbortError") setError((err as Error).message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [requestUrl, tokenUsed, hydrated]);

  // Acessibilidade: focar título após carregar resultados
  useEffect(() => {
    if (!loading && (data?.items?.length ?? 0) > 0) {
      resultsHeadingRef.current?.focus();
    }
  }, [loading, data]);

  // --------------------------------------------
  // Paginação (windowed)
  // --------------------------------------------
  const totalCount = data?.total_count ?? 0;
  const totalPages = useMemo(() => {
    const HARD_LIMIT = 1000; // limite da Search API
    const byPerPage = Math.ceil(totalCount / perPage);
    const apiLimit = Math.ceil(HARD_LIMIT / perPage);
    return Math.max(1, Math.min(byPerPage, apiLimit));
  }, [totalCount, perPage]);

  const pages = useMemo(() => pageWindow(page, totalPages, 2), [page, totalPages]);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // --------------------------------------------
  // Atalhos de teclado
  // --------------------------------------------
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + K → foca a busca
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        controlsRef.current?.focusSearch();
        return;
      }

      // Esc → limpa a busca
      if (e.key === "Escape" && query) {
        e.preventDefault();
        controlsRef.current?.clearSearch();
        return;
      }

      // ← / → → paginação
      if (e.key === "ArrowRight" && canNext) {
        e.preventDefault();
        setPage((p) => Math.min(totalPages, p + 1));
        return;
      }
      if (e.key === "ArrowLeft" && canPrev) {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [query, canNext, canPrev, totalPages]);

  // --------------------------------------------
  // PERFORMANCE: lista deferida + memoizada
  // --------------------------------------------
  const deferredData = useDeferredValue(data);
  const repoCards = useMemo(() => {
    return deferredData?.items?.map((repo) => <RepoCard key={repo.id} repo={repo} />) ?? null;
  }, [deferredData]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Skip link para navegação por teclado */}
      <a
        href="#results-heading"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-emerald-500 focus:text-black focus:px-3 focus:py-2 focus:rounded-lg"
      >
        Pular para resultados
      </a>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[960px]">
        {FEATURES.PAT && <PatControl />}

        <Controls
          ref={controlsRef}
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
          perPage={perPage}
          setPerPage={setPerPage}
          language={language}
          setLanguage={setLanguage}
        />

        {/* STATUS */}
        <div className="mt-4 text-sm text-neutral-400" aria-live="polite">
          {loading && <span>Carregando…</span>}
          {!loading && !error && (
            <span>
              {debouncedQuery ? (
                <>
                  Resultados para <span className="text-neutral-200">“{debouncedQuery}”</span>
                  {language && (
                    <>
                      {" "}
                      em <span className="text-neutral-200">{language}</span>
                    </>
                  )}
                  : {totalCount.toLocaleString("pt-BR")} repositórios
                </>
              ) : (
                <>
                  Exibindo repositórios populares por estrelas
                  {language && (
                    <>
                      {" "}
                      em <span className="text-neutral-200">{language}</span>
                    </>
                  )}
                </>
              )}
            </span>
          )}
          {error && <span className="text-red-400">{error}</span>}
        </div>

        {/* Auth/Rate Info */}
        {(rate.limit !== undefined || rate.remaining !== undefined) && (
          <div className="mt-1 text-xs text-neutral-500">
            {token ? "Autenticação: ativa" : "Autenticação: anônima"} •
            {rate.remaining !== undefined && rate.limit !== undefined && (
              <>
                {" "}
                {rate.remaining}/{rate.limit} requisições restantes
              </>
            )}
            {rate.reset ? (
              <>
                {" "}
                • Reseta {new Date(rate.reset * 1000).toLocaleTimeString("pt-BR")}
              </>
            ) : null}
          </div>
        )}

        {/* RESULTADOS */}
        <section className="mt-4 grid gap-3 w-full">
          {!loading && data?.items?.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-neutral-300">
              Nenhum repositório encontrado.
            </div>
          )}

          <h2
            id="results-heading"
            ref={resultsHeadingRef}
            tabIndex={-1}
            className="sr-only text-white"
          >
            Resultados
          </h2>

          {repoCards}

          {loading && (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          )}
        </section>

        {/* PAGINAÇÃO */}
        <nav className="mt-6 flex items-center justify-between gap-4 w-full" aria-label="Paginação de resultados">
          <button
            type="button"
            disabled={!canPrev}
            aria-disabled={!canPrev}
            aria-label="Página anterior"
            onClick={() => canPrev && setPage((p) => p - 1)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/40"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-1">
            {pages[0] > 1 && (
              <button
                type="button"
                onClick={() => setPage(1)}
                className="px-3 py-2 text-sm rounded-lg hover:bg-white/5"
              >
                1…
              </button>
            )}
            {pages.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`px-3 py-2 text-sm rounded-lg hover:bg-white/5 ${
                  p === page ? "bg-emerald-500/20 text-emerald-200" : ""
                }`}
              >
                {p}
              </button>
            ))}
            {pages[pages.length - 1] < totalPages && (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className="px-3 py-2 text-sm rounded-lg hover:bg-white/5"
              >
                …{totalPages}
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={!canNext}
            aria-disabled={!canNext}
            aria-label="Próxima página"
            onClick={() => canNext && setPage((p) => p + 1)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/40"
          >
            Próxima →
          </button>
        </nav>
      </main>
    </div>
  );
}
