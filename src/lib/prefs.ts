"use client";

/** Valores aceitos */
export const ALLOWED_SORT = ["best", "stars", "updated"] as const;
export const ALLOWED_ORDER = ["asc", "desc"] as const;
export const ALLOWED_PER_PAGE = [10, 20, 30, 50, 100] as const;

export type Sort = (typeof ALLOWED_SORT)[number];
export type Order = (typeof ALLOWED_ORDER)[number];

export type UserPrefs = {
  sort: Sort;
  order: Order;
  perPage: number;
  language: string;
};

export const DEFAULT_PREFS: UserPrefs = {
  sort: "best",
  order: "desc",
  perPage: 10,
  language: "",
};

function clampSort(v: any): Sort {
  return (ALLOWED_SORT as readonly string[]).includes(v) ? (v as Sort) : "best";
}
function clampOrder(v: any): Order {
  return (ALLOWED_ORDER as readonly string[]).includes(v) ? (v as Order) : "desc";
}
function clampPerPage(v: any): number {
  return (ALLOWED_PER_PAGE as readonly number[]).includes(Number(v)) ? Number(v) : 10;
}

/** Aplica clamps garantindo que o objeto final é válido */
export function clampPrefs(p: Partial<UserPrefs> | null | undefined): UserPrefs {
  const base = { ...DEFAULT_PREFS, ...(p || {}) };
  return {
    sort: clampSort(base.sort),
    order: clampOrder(base.order),
    perPage: clampPerPage(base.perPage),
    language: typeof base.language === "string" ? base.language : "",
  };
}

const KEY = "gh:prefs";

/** Lê do localStorage com fallback seguro e clamp */
export function readPrefs(): UserPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return clampPrefs(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Mescla + salva no localStorage já clampado. Retorna o objeto final. */
export function writePrefs(partial: Partial<UserPrefs>): UserPrefs {
  const next = clampPrefs({ ...readPrefs(), ...partial });
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
