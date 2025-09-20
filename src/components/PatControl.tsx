"use client";
import { useState } from "react";
import { isLikelyGithubToken, usePatToken } from "@/lib/usePatToken";

export function PatControl() {
  const { token, save, clear, redacted } = usePatToken(); 
  const [show, setShow] = useState(false);                
  const [draft, setDraft] = useState(token);              

  const valid = !draft || isLikelyGithubToken(draft);     
  const hasToken = !!token;

  return (
    <section
      aria-label="Autenticação GitHub"
      className="w-full max-w-[960px] rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3"
    >
      <label htmlFor="pat" className="text-sm text-neutral-400 min-w-[9ch]">
        GitHub PAT:
      </label>

      <input
        id="pat"
        type={show ? "text" : "password"}                 
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={hasToken ? redacted : "github_pat_...  ou  ghp_..."}
        className={`flex-1 rounded-xl bg-white/5 border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50
          ${valid ? "border-white/10" : "border-red-400/50"}`}
        aria-invalid={!valid}
        aria-describedby="pat-help"
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs hover:border-emerald-400/40"
        aria-pressed={show}
        aria-label={show ? "Esconder token" : "Mostrar token"}
        title={show ? "Esconder token" : "Mostrar token"}
      >
        {show ? "Esconder" : "Mostrar"}
      </button>

      <button
        type="button"
        onClick={() => save(draft)}
        disabled={!valid}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40 disabled:opacity-50"
        title="Salvar token no navegador"
      >
        Salvar
      </button>

      <button
        type="button"
        onClick={() => { setDraft(""); clear(); }}
        disabled={!hasToken && draft === ""}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40 disabled:opacity-50"
        title="Remover token salvo"
      >
        Limpar
      </button>

      <p id="pat-help" className="ml-auto text-xs text-neutral-400">
        O token fica só no seu navegador. Não enviamos para terceiros.
      </p>
    </section>
  );
}
