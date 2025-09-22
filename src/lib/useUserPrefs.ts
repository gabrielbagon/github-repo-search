// src/lib/useUserPrefs.ts
"use client";

import { useCallback, useState } from "react";
import { clampPrefs, readPrefs, writePrefs } from "@/lib/prefs";

export type UserPrefs = ReturnType<typeof readPrefs>;

/**
 * Hook simples para ler/atualizar preferências do usuário (sort, order, perPage, language).
 * Sincroniza o estado local com o localStorage através de writePrefs.
 */
export function useUserPrefs() {
  // Estado inicial vem do storage (cliente)
  const [prefs, setPrefs] = useState<UserPrefs>(() => readPrefs());

  const update = useCallback((partial: Partial<UserPrefs>) => {
    setPrefs((prev) => {
      const next = clampPrefs({ ...prev, ...partial });
      writePrefs(next); // writePrefs não retorna nada; persistimos e devolvemos `next` para o estado
      return next;
    });
  }, []);

  return { prefs, update };
}
