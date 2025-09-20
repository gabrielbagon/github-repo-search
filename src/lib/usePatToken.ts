"use client";
import { useCallback, useMemo, useState } from "react";

const KEY = "gh:pat";

/** Regras simples p/ tokens novos e antigos do GitHub */
const GH_PAT_PATTERNS = [
  /^github_pat_[A-Za-z0-9_]{22,}/, // formato novo
  /^ghp_[A-Za-z0-9]{30,}/,         // formato antigo
];


export function isLikelyGithubToken(s: string) {
  return GH_PAT_PATTERNS.some((re) => re.test(s.trim()));
}


export function redactToken(s: string) {
  const t = s.trim();
  if (!t) return "";
  const last4 = t.slice(-4);
  return `••••••••••••••••${last4}`;
}


export function usePatToken() {
  
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(KEY) ?? "";
    } catch {
      return "";
    }
  });

  
  const save = useCallback((next: string) => {
    const v = next.trim();
    setToken(v);
    try {
      if (v) localStorage.setItem(KEY, v);
      else localStorage.removeItem(KEY);
    } catch {
    }
  }, []);

  
  const clear = useCallback(() => {
    setToken("");
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);

  
  const redacted = useMemo(() => redactToken(token), [token]);

  return { token, save, clear, redacted };
}
