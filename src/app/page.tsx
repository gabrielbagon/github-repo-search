"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildSearchQ } from "@/lib/buildSearchQ";
import { pageWindow } from "@/lib/pageWindow";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { Repo, SearchResponse } from "@/types/github";
// import { RepoCard } from "@/components/RepoCard";
import { Controls } from "@/components/Controls";

export default function Home() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 500);
  const [sort, setSort] = useState<"best" | "stars" | "updated">("best");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<string>("");

  // valores aceitos
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
  if (perPage !== 10) sp.set("per_page", String(perPage)); // default 10
  if (page !== 1) sp.set("page", String(page));            
  if (language) sp.set("lang", language);                  

  const next = sp.toString();
  const target = next ? `${window.location.pathname}?${next}` : window.location.pathname;
  const current = window.location.pathname + window.location.search;

  if (target !== current) {
    history.replaceState(null, "", target);
  }
}, [debouncedQuery, sort, order, perPage, page, language]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
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
      </main>
    </div>
  );
}
