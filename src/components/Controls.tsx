"use client";

import {
	forwardRef,
	useImperativeHandle,
	useRef,
	useEffect,
	useState,
} from "react";

export type ControlsHandle = {
	focusSearch: () => void;
	clearSearch: () => void;
};

// 1) lista de linguagens simples
const LANGS = [
	"",
	"TypeScript",
	"JavaScript",
	"Python",
	"Java",
	"Go",
	"Rust",
] as const;

type Sort = "best" | "stars" | "updated";
type Order = "desc" | "asc";

type Props = {
	query: string;
	setQuery: (v: string) => void;
	sort: Sort;
	setSort: (v: Sort) => void;
	order: Order;
	setOrder: (v: Order) => void;
	perPage: number;
	setPerPage: (n: number) => void;
	language: string;
	setLanguage: (s: string) => void;
};

export const Controls = forwardRef<ControlsHandle, Props>(function Controls(
	{
		query,
		setQuery,
		sort,
		setSort,
		order,
		setOrder,
		perPage,
		setPerPage,
		language,
		setLanguage,
	}: Props,
	ref
) {
	const inputRef = useRef<HTMLInputElement | null>(null); // (1) ref do input

	useImperativeHandle(
		ref,
		() => ({
			focusSearch() {
				inputRef.current?.focus();
			},
			clearSearch() {
				setQuery("");
				inputRef.current?.focus();
			},
		}),
		[setQuery]
	);

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
			{/* INPUT DE BUSCA */}
			<div className="flex-1 relative">
				<label htmlFor="search" className="sr-only">
					Buscar repositórios
				</label>

				<input
					id="search"
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Digite um termo (ex: react, next, aem)"
					className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-neutral-500"
				/>

				{/* botão de limpar (X) */}
				<button
					type="button"
					onClick={() => {
						setQuery("");
						// se tiver callback pra resetar página/filtros, chame aqui
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
					aria-label="Limpar busca"
					// Mantém o nó no SSR e no primeiro render do cliente
					style={{ visibility: query ? "visible" : "hidden" }}
				>
					×
				</button>
			</div>

			{/* (A.1) ← AQUI entra o BLOCO DE LINGUAGEM */}
			<div className="flex items-center gap-2">
				<label htmlFor="language" className="text-sm text-neutral-400">
					Linguagem:
				</label>
				<select
					id="language"
					value={language}
					onChange={(e) => setLanguage(e.target.value)}
					className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
				>
					{LANGS.map((l) => (
						<option key={l || "any"} value={l}>
							{l ? l : "Qualquer"}
						</option>
					))}
				</select>
			</div>

			{/* (B) ORDENAR */}
			<div className="flex items-center gap-2">
				<label htmlFor="sort" className="text-sm text-neutral-400">
					Ordenar:
				</label>
				<select
					id="sort"
					value={sort}
					onChange={(e) => setSort(e.target.value as Sort)}
					className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
				>
					<option value="best">Melhor correspondência</option>
					<option value="stars">Estrelas</option>
					<option value="updated">Última atualização</option>
				</select>
			</div>

			{/* (C) ORDEM (condicional) */}
			<div className="flex items-center gap-2">
				<label htmlFor="order" className="text-sm text-neutral-400">
					Ordem:
				</label>
				<select
					id="order"
					value={order}
					onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
					// Evita mismatch: no SSR e no primeiro render no cliente fica desabilitado,
					// depois do mount muda para (sort === "best")
					disabled={!mounted || sort === "best"}
					aria-disabled={!mounted || sort === "best"}
					className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<option value="desc">Descendente</option>
					<option value="asc">Ascendente</option>
				</select>
			</div>

			{/* (D) POR PÁGINA */}
			<div className="flex items-center gap-2">
				<label htmlFor="perPage" className="text-sm text-neutral-400">
					Por página:
				</label>
				<select
					id="perPage"
					value={perPage}
					onChange={(e) => setPerPage(Number(e.target.value))}
					className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
				>
					{[10, 20, 30, 50, 100].map((n) => (
						<option key={n} value={n}>
							{n}
						</option>
					))}
				</select>
			</div>
		</div>
	);
});
