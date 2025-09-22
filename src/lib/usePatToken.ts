// src/lib/usePatToken.ts
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "grs_pat";

/**
 * Heurística simples para validar um provável GitHub PAT.
 * Cobre formatos modernos (github_pat_...) e clássicos (gh[p|o|u|s|v]_...).
 */
export function isLikelyGithubToken(s: string): boolean {
  if (!s) return false;
  const t = s.trim();

  // Moderno
  if (t.startsWith("github_pat_")) return t.length >= 22;

  // Clássicos: ghp_, gho_, ghu_, ghs_, ghv_
  if (/^gh[opusv]_[A-Za-z0-9_]{20,}$/.test(t)) return true;

  // Fallback conservador
  return t.length >= 20;
}

function safeGet(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // localStorage indisponível (SSR / privacy mode)
    return "";
  }
}

function safeSet(v: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Ignora erro de storage (quota, privacy, etc.)
    return;
  }
}

function safeClear(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignora erro de storage
    return;
  }
}

function redact(token: string): string {
  if (!token) return "";
  return "••••••••••••••••" + token.slice(-4);
}

export type UsePatToken = {
  token: string;
  redacted: string;
  save: (v: string) => void;
  clear: () => void;
};

/**
 * Hook para gerenciar o GitHub PAT no localStorage.
 */
export function usePatToken(): UsePatToken {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(safeGet());
  }, []);

  const save = useCallback((v: string) => {
    setToken(v);
    safeSet(v);
  }, []);

  const clear = useCallback(() => {
    setToken("");
    safeClear();
  }, []);

  return { token, redacted: redact(token), save, clear };
}
