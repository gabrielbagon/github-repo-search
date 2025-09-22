// src/config.ts
export interface FeatureFlags {
  PAT: boolean;
  SAVED_SEARCHES: boolean;
}

export const FEATURES: Readonly<FeatureFlags> = {
  PAT: true,
  SAVED_SEARCHES: true,
} as const;
// Leitura opcional de env (útil se quiser ligar via NEXT_PUBLIC_FEATURE_PAT=1)
const fromEnv =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FEATURE_PAT === "1";

/**
 * TESTES APENAS: permite alterar flags em runtime nos testes.
 * Não use isso no código da aplicação.
 */
export function __setFeatureForTests(name: keyof FeatureFlags, value: boolean) {
  // cast para escapar do readonly só DENTRO desta função de testes
  (FEATURES as any)[name] = value;
}


