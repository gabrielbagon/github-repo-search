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
