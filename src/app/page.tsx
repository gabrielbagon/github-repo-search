// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Navbar } from "@/components/Navbar";
import { buildSearchQ } from "@/lib/buildSearchQ";
import { pageWindow } from "@/lib/pageWindow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { SearchResponse } from "@/types/github";
import { RepoCard } from "@/components/RepoCard";
import { Controls } from "@/components/Controls";
import type { ControlsHandle } from "@/components/Controls";
import { FEATURES } from "@/config";
import { PatControl } from "@/components/PatControl";
import { usePatToken } from "@/lib/usePatToken";
import { clampPrefs, readPrefs, writePrefs } from "@/lib/prefs";
import { Footer } from "@/components/Footer";

export default function Home() {
	const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
	const controlsRef = useRef<ControlsHandle | null>(null);

	// Mostrar/esconder o painel PAT
	const [showPat, setShowPat] = useState<boolean>(FEATURES.PAT ?? false);

	// Helpers de clamp
	const ALLOWED_SORT = new Set(["best", "stars", "updated"] as const);
	const ALLOWED_ORDER = new Set(["asc", "desc"] as const);
	const ALLOWED_PER_PAGE = [10, 20, 30, 50, 100] as const;

	const clampPerPage = (v: number) =>
		ALLOWED_PER_PAGE.includes(v as any) ? v : 10;
	const clampPage = (v: number) => (Number.isFinite(v) && v >= 1 ? v : 1);

	// Estado inicial: lê URL + prefs apenas no cliente para evitar hydration mismatch
	const init = useMemo(() => {
		if (typeof window === "undefined") {
			return {
				query: "",
				sort: "best" as const,
				order: "desc" as const,
				perPage: 10,
				page: 1,
				language: "",
			};
		}
		const sp = new URLSearchParams(window.location.search);
		const stored = readPrefs();
		const clampedPrefs = clampPrefs({
			sort: (sp.get("sort") ?? stored.sort) as any,
			order: (sp.get("order") ?? stored.order) as any,
			perPage: Number(sp.get("per_page") ?? stored.perPage),
			language: (sp.get("lang") ?? stored.language) || "",
		});
		return {
			query: sp.get("q") ?? "",
			sort: ALLOWED_SORT.has(clampedPrefs.sort) ? clampedPrefs.sort : "best",
			order: ALLOWED_ORDER.has(clampedPrefs.order) ? clampedPrefs.order : "desc",
			perPage: clampPerPage(clampedPrefs.perPage),
			page: clampPage(Number(sp.get("page") ?? 1)),
			language: clampedPrefs.language,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//  Defaults estáveis para SSR — nada de window aqui
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<"best" | "stars" | "updated">("best");
	const [order, setOrder] = useState<"desc" | "asc">("desc");
	const [perPage, setPerPage] = useState(10);
	const [page, setPage] = useState(1);
	const [language, setLanguage] = useState<string>("");
 
  // Filtro versão Mobile
  const [filtersOpen, setFiltersOpen] = useState(true);


	// Hidratar do URL + localStorage APÓS montar (evita hydration mismatch)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const sp = new URLSearchParams(window.location.search);
		const stored = readPrefs();
		const clampedPrefs = clampPrefs({
			sort: (sp.get("sort") ?? stored.sort) as any,
			order: (sp.get("order") ?? stored.order) as any,
			perPage: Number(sp.get("per_page") ?? stored.perPage),
			language: (sp.get("lang") ?? stored.language) || "",
		});
		setQuery(sp.get("q") ?? "");
		setSort(ALLOWED_SORT.has(clampedPrefs.sort) ? clampedPrefs.sort : "best");
		setOrder(ALLOWED_ORDER.has(clampedPrefs.order) ? clampedPrefs.order : "desc");
		setPerPage(clampPerPage(clampedPrefs.perPage));
		setPage(clampPage(Number(sp.get("page") ?? 1)));
		setLanguage(clampedPrefs.language);
    setHydrated(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
  useEffect(() => {
		if (typeof window === "undefined") setHydrated(true);
	}, []);

	// Botão "Limpar filtros"
	const handleClearFilters = () => {
		setQuery("");
		setLanguage("");
		setSort("best");
		setOrder("desc");
		setPerPage(10);
		setPage(1);
		controlsRef.current?.focusSearch?.();
	};

	const isDefaultFilters =
		query === "" &&
		language === "" &&
		sort === "best" &&
		order === "desc" &&
		perPage === 10 &&
		page === 1;

	// Copiar link
	const [copied, setCopied] = useState(false);
	const handleCopyLink = async () => {
		if (typeof window === "undefined" || !navigator?.clipboard) return;
		try {
			await navigator.clipboard.writeText(window.location.href);
		} catch {
			// fallback sem Clipboard API
			const el = document.createElement("textarea");
			el.value = window.location.href;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	// Debounce + transição p/ digitação fluida
	const [isPending, startTransition] = useTransition();
	const safeSetQuery = (v: string) => startTransition(() => setQuery(v));
	const debouncedQuery = useDebouncedValue(query, 500);

	// flag para atributos dinâmicos (disabled etc.)
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
  
  const [hydrated, setHydrated] = useState(false);

	// Reset page quando filtros mudam
	useEffect(() => {
    if (!hydrated) return;
		setPage(1);
	}, [debouncedQuery, perPage, sort, order, language, hydrated]);
  
  

	// Persistir prefs
	useEffect(() => {
		writePrefs({ sort, order, perPage, language });
	}, [sort, order, perPage, language]);

	// Dados + request
	const [data, setData] = useState<SearchResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errorCode, setErrorCode] = useState<number | null>(null);
	const controllerRef = useRef<AbortController | null>(null);

	// PAT
	const { token } = usePatToken();
	const tokenUsed = FEATURES.PAT ? token : "";

	// Rate-limit info
	const [rate, setRate] = useState<{ limit?: number; remaining?: number; reset?: number }>({});

	// URL da Search API
	const requestUrl = useMemo(() => {
		const q = buildSearchQ(debouncedQuery, language);
		const sp = new URLSearchParams();
		sp.set("q", q);
		if (sort !== "best") {
			sp.set("sort", sort);
			sp.set("order", order);
		}
		sp.set("per_page", String(perPage));
		sp.set("page", String(page));
		return `https://api.github.com/search/repositories?${sp.toString()}`;
	}, [debouncedQuery, language, sort, order, perPage, page]);

	// Deep-linking: sincroniza a URL do navegador
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
		if (target !== current) history.replaceState(null, "", target);
	}, [debouncedQuery, sort, order, perPage, page, language]);

	// Fetch com cancelamento e captura de rate-limit
  
	useEffect(() => {
    if (!hydrated) return;
		setError(null);
		setErrorCode(null);
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
					setErrorCode(403);
					let details = "";
					if (remaining === 0 && reset) {
						const when = new Date(reset * 1000);
						details = ` — limite reinicia em ${when.toLocaleString("pt-BR")}`;
					}
					throw new Error(`Limite da Search API atingido${details}.`);
				}
				if (!res.ok) {
					setErrorCode(res.status);
					throw new Error(`Erro ${res.status}: ${res.statusText}`);
				}
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

	// Foco no heading após carregar resultados
	useEffect(() => {
		if (!loading && (data?.items?.length ?? 0) > 0) {
			resultsHeadingRef.current?.focus();
		}
	}, [loading, data]);

	// Paginação
	const totalCount = data?.total_count ?? 0;
	const totalPages = useMemo(() => {
		const HARD_LIMIT = 1000;
		const byPerPage = Math.ceil(totalCount / perPage);
		const apiLimit = Math.ceil(HARD_LIMIT / perPage);
		return Math.max(1, Math.min(byPerPage, apiLimit));
	}, [totalCount, perPage]);

	const pages = useMemo(() => pageWindow(page, totalPages, 2), [page, totalPages]);
	const canPrev = page > 1;
	const canNext = page < totalPages;

	// Atalhos de teclado
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				controlsRef.current?.focusSearch?.();
				return;
			}
			if (e.key === "Escape" && query) {
				e.preventDefault();
				controlsRef.current?.clearSearch?.();
				return;
			}
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

	const hasItems = (data?.items?.length ?? 0) > 0;
	const isInitialEmpty = !debouncedQuery && !loading && !hasItems && !error;
	const isQueryEmpty = !!debouncedQuery && !loading && !hasItems && !error;

	const clearDisabled = !mounted || isDefaultFilters;
	const copyDisabled = !mounted;

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-4 sm:p-8 lg:p-12 pb-20 gap-10 sm:gap-16">
			{/* Skip link */}
			<a
				href="#results-heading"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-emerald-500 focus:text-black focus:px-3 focus:py-2 focus:rounded-lg"
			>
				Pular para resultados
			</a>

			{/* Navbar com toggle do PAT */}
			<Navbar patOpen={showPat} onTogglePat={() => setShowPat((v) => !v)} />

			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[960px]">
				{/* PAT panel */}
				{FEATURES.PAT && showPat && (
					<section id="pat-section" aria-label="Autenticação GitHub" className="w-full">
						<PatControl />
					</section>
				)}
{/* Toggle de filtros — só no mobile; em ≥sm o painel fica sempre visível */}
<div className="w-full -mt-2 sm:hidden">
  <button
    type="button"
    onClick={() => setFiltersOpen(v => !v)}
    aria-expanded={filtersOpen}
    aria-controls="filters-panel"
    className="w-full inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
    title={filtersOpen ? "Hide filters" : "Show filters"}
  >
    <span>Filters</span>
    <span aria-hidden="true">{filtersOpen ? "▴" : "▾"}</span>
  </button>
</div>

{/* Painel de filtros — no mobile obedece ao toggle; em ≥sm é sempre visível */}
<div
  id="filters-panel"
  className={`${filtersOpen ? "block" : "hidden"} sm:block w-full`}
>
  <Controls
    ref={controlsRef as any}
    query={query}
    setQuery={safeSetQuery}
    sort={sort}
    setSort={setSort}
    order={order}
    setOrder={setOrder}
    perPage={perPage}
    setPerPage={setPerPage}
    language={language}
    setLanguage={setLanguage}
  />

{/* Ações rápidas: Copiar link / Limpar filtros */}
<div className="w-full -mt-2 flex justify-end gap-2">
   <button
      type="button"
      onClick={handleClearFilters}
      aria-label="Limpar filtros"
      title="Limpar filtros"
      disabled={clearDisabled}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40 disabled:opacity-50"
    >
      Limpar filtros
    </button>
</div>
</div>


				{/* STATUS compacto */}
				<div className="mt-1 text-xs text-neutral-500" aria-live="polite">
					{token ? "Autenticação: ativa" : "Autenticação: anônima"} •{" "}
					{rate.remaining ?? 0}/{rate.limit ?? 0} requisições restantes
				</div>

				{/* EMPTY (inicial) */}
				{isInitialEmpty && (
					<section className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-6">
						<h2 className="text-base font-medium text-white">Busque por repositórios</h2>
						<p className="mt-2 text-sm text-neutral-300">
							Digite um termo no campo acima (ex.: <span className="text-neutral-100">react</span>,{" "}
							<span className="text-neutral-100">next</span>, <span className="text-neutral-100">aem</span>).
						</p>
						<p className="mt-2 text-xs text-neutral-400">Dica: use o filtro de linguagem para refinar os resultados.</p>
					</section>
				)}

				{/* ERROR */}
				{error && (
					<section
						role="alert"
						className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"
					>
						<p className="text-sm">{error}</p>
						{errorCode === 403 && (
							<p className="mt-2 text-xs text-red-300">
								Dica: a Search API do GitHub é limitada para usuários anônimos. Adicione um <strong>PAT</strong> para elevar seu
								limite.
							</p>
						)}
					</section>
				)}

				{/* RESULTADOS / EMPTY(query) / SKELETON */}
				<section className="mt-4 grid gap-3 w-full">
					<h2 id="results-heading" ref={resultsHeadingRef} tabIndex={-1} className="sr-only text-white">
						Resultados
					</h2>

					{/* EMPTY da busca sem resultados */}
					{isQueryEmpty && (
						<div className="rounded-xl border border-white/10 bg-white/5 p-6 text-neutral-300">
							Nenhum repositório encontrado
							{debouncedQuery ? (
								<>
									{" "}
									para <span className="text-neutral-100">“{debouncedQuery}”</span>
									{language && (
										<>
											{" "}
											em <span className="text-neutral-100">{language}</span>
										</>
									)}
									.
								</>
							) : (
								"."
							)}
							<div className="mt-2 text-sm text-neutral-400">Tente alterar os filtros, trocar a linguagem ou usar outro termo.</div>
						</div>
					)}

					{/* Lista */}
					{data?.items?.map((repo) => (
						<RepoCard key={repo.id} repo={repo} />
					))}

					{/* Empty explícito (zero itens) */}
					{!loading && data && data.items.length === 0 && (
						<div className="rounded-xl border border-white/10 bg-white/5 p-6 text-neutral-300">
							Nenhum repositório encontrado.
						</div>
					)}

					{/* Skeleton */}
					{loading && (
						<div className="grid gap-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
							))}
						</div>
					)}
				</section>

				{/* Paginação */}
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

					<div className="hidden sm:flex items-center gap-1">
						{pages[0] > 1 && (
							<button type="button" onClick={() => setPage(1)} className="px-3 py-2 text-sm rounded-lg hover:bg-white/5">
								1…
							</button>
						)}
						{pages.map((p) => (
							<button
								key={p}
								type="button"
								onClick={() => setPage(p)}
								aria-current={p === page ? "page" : undefined}
								className={`px-3 py-2 text-sm rounded-lg hover:bg-white/5 ${p === page ? "bg-emerald-500/20 text-emerald-200" : ""}`}
							>
								{p}
							</button>
						))}
						{pages[pages.length - 1] < totalPages && (
							<button type="button" onClick={() => setPage(totalPages)} className="px-3 py-2 text-sm rounded-lg hover:bg-white/5">
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

			<Footer />
		</div>
	);
}
