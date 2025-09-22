// src/config.ts

/**
 * Feature flags do app.
 * Mantemos como objeto mutável (sem `as const`) para poder ajustar em testes.
 */
export const FEATURES = {
  PAT: true,
  SAVED_SEARCHES: false,
  NAVBAR_SAVED_MENU: true,
};

export type FeatureKey = keyof typeof FEATURES;

/**
 * Utilitário apenas para testes.
 * Permite alternar uma feature sem usar `any`.
 */
export function __setFeatureForTests<K extends FeatureKey>(
  key: K,
  value: boolean
): void {
  FEATURES[key] = value;
}
