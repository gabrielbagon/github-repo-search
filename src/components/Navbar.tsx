'use client';

import Link from 'next/link';
import * as React from 'react';
import { GRSLogoLockup } from '@/asset/GRSLogoLockup';
import { FEATURES } from '@/config';

type NavbarProps = {
  patOpen: boolean;
  onTogglePat: () => void;
  
};

export function Navbar({ patOpen, onTogglePat }: NavbarProps) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/60 border-b border-white/10"
    >
      <div className="mx-auto w-full max-w-[960px] px-3 py-2 flex items-center justify-between gap-3">
        <Link aria-label="Go to home" href="/" className="flex items-center gap-2 text-sm font-medium text-white hover:opacity-90">
          <GRSLogoLockup style={{ color: '#e5e7eb' }} />
        </Link>

        <nav aria-label="Top navigation" className="flex items-center gap-3">
         
          {FEATURES.PAT && (
            <button
              type="button"
              aria-controls="pat-section"
              aria-pressed={patOpen}
              title={patOpen ? 'Hide PAT panel' : 'Show PAT panel'}
              onClick={onTogglePat}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
            >
              PAT ▾
            </button>
          )}

          <span className="hidden sm:inline text-xs text-neutral-400" title="Press ⌘K (or Ctrl+K) to focus search">
            ⌘K
          </span>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Open GitHub"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-emerald-400/40"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
