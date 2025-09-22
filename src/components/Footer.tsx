// src/components/Footer.tsx
export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="row-start-3 w-full mt-10 border-t border-white/10 pt-4"
      aria-label="Site footer"
    >
      <div className="mx-auto w-full max-w-[960px] px-3 text-xs text-neutral-400 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>
          Built for a coding challenge — <span className="text-neutral-300">GitHub Repo Search</span>
        </p>

        <nav aria-label="Footer links" className="flex items-center gap-3">
          <a
            href="https://www.githubstatus.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:border-emerald-400/40"
            aria-label="Open GitHub status page"
            title="GitHub Status"
          >
            API Status
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 hover:border-emerald-400/40"
            aria-label="Open project repository"
            title="Project Repository"
          >
            Repository
          </a>
        </nav>
      </div>
    </footer>
  );
}
