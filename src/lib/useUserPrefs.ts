"use client";
import { useCallback, useState } from "react";
import { readPrefs, writePrefs, type UserPrefs } from "@/lib/prefs";


export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(() => readPrefs());

  const update = useCallback((partial: Partial<UserPrefs>) => {
    const next = writePrefs(partial);
    setPrefs(next);
  }, []);

  return { prefs, update };
}