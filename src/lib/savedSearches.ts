// src/lib/savedSearches.ts
import { useCallback, useEffect, useState } from "react";

export type Sort = "best" | "stars" | "updated";
export type Order = "asc" | "desc";

export interface SavedSearch {
  id: string;
  q: string;
  language: string;
  sort: Sort;
  order: Order;
  perPage: number;
  createdAt: number;
}

const KEY = "gh:saved";

export function readSaved(): SavedSearch[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

export function writeSaved(list: SavedSearch[]) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
  } catch {
    // ignore quota or privacy errors
  }
}

function makeId(s: {
  q: string;
  language: string;
  sort: Sort;
  order: Order;
  perPage: number;
}) {
  return `${s.q ?? ""}|${s.language ?? ""}|${s.sort}|${s.order}|${s.perPage}`;
}

export function useSavedSearches() {
  const [list, setList] = useState<SavedSearch[]>([]);

  // hydrate once
  useEffect(() => {
    if (typeof window === "undefined") return;
    setList(readSaved());
  }, []);

  const add = useCallback(
    (s: Omit<SavedSearch, "id" | "createdAt">) => {
      const id = makeId(s);
      setList((prev) => {
        if (prev.some((x) => x.id === id)) return prev;
        const next = [...prev, { id, createdAt: Date.now(), ...s }];
        writeSaved(next);
        return next;
      });
    },
    []
  );

  const remove = useCallback((id: string) => {
    setList((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeSaved(next);
      return next;
    });
  }, []);

  const isSavedFor = useCallback(
    (s: { q: string; language: string; sort: Sort; order: Order; perPage: number }) => {
      const id = makeId(s);
      return list.some((x) => x.id === id);
    },
    [list]
  );

  return { list, add, remove, isSavedFor };
}
