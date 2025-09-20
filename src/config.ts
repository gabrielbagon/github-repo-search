// src/config.ts
type FeatureFlags = {
  PAT: boolean;
};

// Valores padrão (produção)
const defaults: FeatureFlags = {
  PAT: false,
};

// Leitura opcional de env (útil se quiser ligar via NEXT_PUBLIC_FEATURE_PAT=1)
const fromEnv =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FEATURE_PAT === "1";

// Objeto exposto como somente leitura para o app
export const FEATURES: Readonly<FeatureFlags> = {
  PAT: fromEnv ? true : defaults.PAT,
} as const;

/**
 * TESTES APENAS: permite alterar flags em runtime nos testes.
 * Não use isso no código da aplicação.
 */
export function __setFeatureForTests(name: keyof FeatureFlags, value: boolean) {
  // cast para escapar do readonly só DENTRO desta função de testes
  (FEATURES as any)[name] = value;
}
