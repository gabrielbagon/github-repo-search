export type SortOption = 'best' | 'stars' | 'updated';
export type OrderOption = 'asc' | 'desc';

export interface UserPrefs {
  sort: SortOption;
  order: OrderOption;
  perPage: number;
  language: string;
}

const DEFAULTS: UserPrefs = {
  sort: 'best',
  order: 'desc',
  perPage: 10,
  language: '',
};

const ALLOWED_SORT: ReadonlySet<SortOption> = new Set(['best', 'stars', 'updated']);
const ALLOWED_ORDER: ReadonlySet<OrderOption> = new Set(['asc', 'desc']);
const ALLOWED_PER_PAGE = [10, 20, 30, 50, 100] as const;

function clampPerPage(v: number | undefined): number {
  if (!Number.isFinite(v)) return DEFAULTS.perPage;
  return (ALLOWED_PER_PAGE as readonly number[]).includes(v as number) ? (v as number) : DEFAULTS.perPage;
}

export function clampPrefs(input: Partial<UserPrefs>): UserPrefs {
  const sort = ALLOWED_SORT.has(input.sort as SortOption) ? (input.sort as SortOption) : DEFAULTS.sort;
  const order = ALLOWED_ORDER.has(input.order as OrderOption) ? (input.order as OrderOption) : DEFAULTS.order;
  const perPage = clampPerPage(input.perPage);
  const language = typeof input.language === 'string' ? input.language : DEFAULTS.language;

  return { sort, order, perPage, language };
}

const LS_KEY = 'gh_repo_search_prefs_v1';

export function readPrefs(): UserPrefs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<UserPrefs>;
    return clampPrefs(parsed);
  } catch {
    return DEFAULTS;
  }
}

export function writePrefs(next: Partial<UserPrefs>): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = clampPrefs(next);
    window.localStorage.setItem(LS_KEY, JSON.stringify(clamped));
  } catch {
    // noop
  }
}
