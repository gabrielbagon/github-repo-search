// src/lib/usePatToken.ts
import { useCallback, useEffect, useState } from "react";

const LS_KEY = "github_pat";

type HookReturn = {
  token: string;
  /** salva no estado e tenta persistir em localStorage */
  save: (next: string) => void;
  /** limpa no estado e tenta remover do localStorage */
  clear: () => void;

  /** aliases para compatibilidade com componentes já existentes */
  setToken: (next: string) => void;
  clearToken: () => void;

  /** erro não-fatal de persistência (ex.: localStorage indisponível) */
  error: string | null;
};

export function usePatToken(): HookReturn {
  const [token, setTokenState] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Hidrata do localStorage quando disponível
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const v = window.localStorage.getItem(LS_KEY);
      if (v) setTokenState(v);
    } catch (err) {
      void err; // marca como "usado" para o linter
      setError("Unable to access localStorage to read PAT.");
    }
  }, []);

  const save = useCallback((next: string) => {
    setTokenState(next);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LS_KEY, next);
      }
    } catch (err) {
      void err;
      setError("Unable to persist PAT in localStorage.");
    }
  }, []);

  const clear = useCallback(() => {
    setTokenState("");
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(LS_KEY);
      }
    } catch (err) {
      void err;
      setError("Unable to clear PAT from localStorage.");
    }
  }, []);

  // Aliases para retrocompatibilidade com componentes/tests
  return {
    token,
    save,
    clear,
    setToken: save,
    clearToken: clear,
    error,
  };
}
