// src/components/Navbar.tsx
"use client";

import { useMemo } from "react";
import { usePatToken } from "@/lib/usePatToken";
import Image from "next/image";

export function Navbar() {
  // pega o token salvo (se existir)
  const { token } = usePatToken();

  // deriva o status visual só quando token mudar
  const auth = useMemo(
    () =>
      token
        ? { label: "Auth: Active", dot: "bg-emerald-400" }
        : { label: "Auth: Anonymous", dot: "bg-neutral-400" },
    [token]
  );

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/60 border-b border-white/10"
    >
      <div className="mx-auto w-full max-w-[960px] px-3 py-2 flex items-center justify-between gap-3">
        {/* brand */}
        <a
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-90"
          aria-label="Go to home"
        >
          {/* logotipo simples  */}
          <Image src={"/github-mark-white.svg"} alt="Github logo" width={40} height={40} />
          GitHub Repo Search
        </a>

        {/* ações à direita */}
        <nav aria-label="Top navigation" className="flex items-center gap-3">
          {/* badge de auth */}
          <span className="inline-flex items-center gap-2 text-xs text-neutral-300">
            <span className={`h-2 w-2 rounded-full ${auth.dot}`} aria-hidden="true" />
            {auth.label}
          </span>

          {/* dica de atalho */}
          <span
            title="Pressione ⌘K (ou Ctrl+K) para focar a busca"
            className="hidden sm:inline text-xs text-neutral-400"
          >
            ⌘K
          </span>

          {/* link para GitHub (genérico) */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
            aria-label="Open GitHub"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
