"use client";
import { Repo } from "@/types/github";             
import { formatDate } from "@/lib/formatDate";     

function Star() {                                  
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" className="inline-block align-sub">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="currentColor" />
    </svg>
  );
}

export function RepoCard({ repo }: { repo: Repo }) {        
  return (
    <article
      className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-400/40 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Avatar do owner */}
        <img
          alt={`Avatar de ${repo.owner.login}`}              
          src={repo.owner.avatar_url}
          className="w-12 h-12 rounded-lg object-cover"
          loading="lazy"
        />

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium truncate">
            <a
              className="hover:underline underline-offset-4"
              href={repo.html_url}
              target="_blank"
              rel="noreferrer noopener"                      
              aria-label={`Abrir ${repo.full_name} no GitHub`}
            >
              {repo.full_name}                               {/* ex.: facebook/react */}
            </a>
          </h2>

          {/* Descrição opcional */}
          {repo.description && (
            <p className="mt-1 text-sm text-neutral-300 line-clamp-2">
              {repo.description}
            </p>
          )}

          {/* Métricas */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            <span
              className="inline-flex items-center gap-1"
              aria-label={`${repo.stargazers_count} estrelas`}
              title={`${repo.stargazers_count.toLocaleString("pt-BR")} estrelas`}
            >
              <Star />
              {repo.stargazers_count.toLocaleString("pt-BR")}  {/* (7) número com locale */}
            </span>
            <span className="text-neutral-400">•</span>
            <span>Atualizado em {formatDate(repo.updated_at)}</span> {/* (8) data bonita */}
          </div>
        </div>
      </div>
    </article>
  );
}