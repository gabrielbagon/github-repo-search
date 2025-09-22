"use client";

import { useEffect, useMemo, useState } from "react";
import { SavedSearch, useSavedSearches } from "@/lib/savedSearches";

function toSearchHref(s: SavedSearch) {
  const sp = new URLSearchParams();
  if (s.q) sp.set("q", s.q);
  if (s.language) sp.set("lang", s.language);
  sp.set("sort", s.sort);
  sp.set("order", s.order);
  sp.set("per_page", String(s.perPage));
  sp.set("page", "1");
  return `/?${sp.toString()}`;
}

function labelFor(s: SavedSearch) {
  const parts: string[] = [];
  if (s.q) parts.push(`“${s.q}”`);
  if (s.language) parts.push(s.language);
  parts.push(`${s.sort} / ${s.order}`);
  parts.push(`${s.perPage}/page`);
  return parts.join(" • ");
}

export default function SavedSearchesMenu() {
  const { list, remove } = useSavedSearches();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const sorted = useMemo(
    () => [...list].sort((a, b) => b.createdAt - a.createdAt),
    [list]
  );

  // Evita hydration mismatch: não renderiza itens dinâmicos antes do mount
  if (!mounted) {
    return (
      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded="false"
          title="Saved searches"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
        >
          Saved ▾
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="Saved searches"
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
      >
        Saved ▾
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Saved searches menu"
          className="absolute right-0 mt-2 w-[320px] rounded-xl border border-white/10 bg-black/70 backdrop-blur p-2 shadow-lg"
        >
          {sorted.length === 0 ? (
            <div className="px-3 py-2 text-xs text-neutral-400">
              No saved searches yet.
            </div>
          ) : (
            <ul className="max-h-[50vh] overflow-auto">
              {sorted.map((s) => (
                <li key={s.id} className="group">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <a
                      role="menuitem"
                      href={toSearchHref(s)}
                      className="flex-1 rounded-lg px-2 py-2 text-sm hover:bg-white/5"
                      onClick={() => setOpen(false)}
                      title="Open this saved search"
                    >
                      <div className="truncate">{labelFor(s)}</div>
                    </a>
                    <button
                      type="button"
                      title="Remove from saved"
                      aria-label="Remove saved search"
                      onClick={() => remove(s.id)}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs opacity-80 hover:opacity-100 hover:border-emerald-400/40"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
