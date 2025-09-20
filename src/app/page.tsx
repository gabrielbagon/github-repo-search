"use client";

import { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { buildSearchQ } from "@/lib/buildSearchQ";
import { pageWindow } from "@/lib/pageWindow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { Repo, SearchResponse } from "@/types/github";
import { RepoCard } from "@/components/RepoCard";
import { Controls } from "@/components/Controls";

export default function Home() {

  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null); 
  
  // UI State
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 500);
  const [sort, setSort] = useState<"best" | "stars" | "updated">("best");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<string>("");
  // Reset page when filters change
 useEffect(() => {
    setPage(1);
  }, [debouncedQuery, perPage, sort, order, language]);


  // Hidratar estado via URL
const ALLOWED_SORT = new Set(["best", "stars", "updated"] as const);
const ALLOWED_ORDER = new Set(["asc", "desc"] as const);
const ALLOWED_PER_PAGE = [10, 20, 30, 50, 100] as const;

function clampPerPage(v: number) {
    return ALLOWED_PER_PAGE.includes(v as any) ? v : 10;
  }
  function clampPage(v: number) {
    return Number.isFinite(v) && v >= 1 ? v : 1;
  }

// hidratar uma única vez 

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);

    const q = sp.get("q") ?? "";
    const s = (sp.get("sort") as "best" | "stars" | "updated") || "best";
    const o = (sp.get("order") as "asc" | "desc") || "desc";
    const pp = clampPerPage(Number(sp.get("per_page")));
    const pg = clampPage(Number(sp.get("page")));
    const lang = sp.get("lang") ?? "";

    setQuery(q);
    setSort(ALLOWED_SORT.has(s) ? s : "best");
    setOrder(ALLOWED_ORDER.has(o) ? o : "desc");
    setPerPage(pp);
    setPage(pg);
    setLanguage(lang);
  }, []);

useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, [debouncedQuery, sort, order, perPage, page, language]);

// 1) estado de dados + AbortController 
const [data, setData] = useState<SearchResponse | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const controllerRef = useRef<AbortController | null>(null);

// API (memo)
const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("q", buildSearchQ(debouncedQuery, language));
    if (sort !== "best") {
      params.set("sort", sort);
      params.set("order", order);
    }
    params.set("per_page", String(perPage));
    params.set("page", String(page));
    return `https://api.github.com/search/repositories?${params.toString()}`;
  }, [debouncedQuery, language, sort, order, perPage, page]);

  // Fetch com cancelamento e erros
  useEffect(() => {
    setError(null);
    setLoading(true);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };

    fetch(requestUrl, { signal: controller.signal, headers })
      .then(async (res) => {
        if (res.status === 403) {
          const remaining = res.headers.get("x-ratelimit-remaining");
          const reset = res.headers.get("x-ratelimit-reset");
          let details = "";
          if (remaining === "0" && reset) {
            const when = new Date(Number(reset) * 1000);
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
  }, [requestUrl]);

  // Paginação (windowed)
  const totalCount = data?.total_count ?? 0;
	const totalPages = useMemo(() => {
		const HARD_LIMIT = 1000;
		const byPerPage = Math.ceil(totalCount / perPage);
		const apiLimit = Math.ceil(HARD_LIMIT / perPage);
		return Math.max(1, Math.min(byPerPage, apiLimit));
	}, [totalCount, perPage]);

	const pages = useMemo(
		() => pageWindow(page, totalPages, 2),
		[page, totalPages]
	);
	const canPrev = page > 1;
	const canNext = page < totalPages;

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
				<Controls
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
									Resultados para{" "}
									<span className="text-neutral-200">“{debouncedQuery}”</span>
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

					{/* RepoCard */}
					{data?.items?.map((repo) => (
						<RepoCard key={repo.id} repo={repo} />
					))}

					{/* Skeletons enquanto carrega */}
					{loading && (
						<div className="grid gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div
									key={i}
									className="h-24 animate-pulse rounded-xl bg-white/5"
								/>
							))}
						</div>
					)}
				</section>

				{/* PAGINAÇÃO */}
				<nav
					className="mt-6 flex items-center justify-between gap-4 w-full"
					aria-label="Paginação de resultados"
				>
					<button
						type="button"
						disabled={!canPrev}
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
