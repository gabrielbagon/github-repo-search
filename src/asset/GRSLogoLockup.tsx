import * as React from 'react';

export function GRSLogoLockup(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      aria-labelledby="grs-title grs-desc"
      viewBox="0 0 520 128"
      width={300}
      {...props}
    >
      <title id="grs-title">GitHub Repo Search — Logo</title>
      <desc id="grs-desc">
        Logo horizontal com ícone de grafo de commits e lupa seguido do nome do projeto.
      </desc>
      <g transform="translate(0,0)" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round">
        <line x1="40" y1="20" x2="40" y2="108" />
        <circle cx="40" cy="28" r="10" />
        <circle cx="40" cy="100" r="10" />
        <circle cx="80" cy="64" r="24" />
        <line x1="97" y1="81" x2="114" y2="98" />
      </g>
      <g transform="translate(140,0)">
        <text
          x="0"
          y="74"
          fill="currentColor"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontSize="36"
          fontWeight={600}
          letterSpacing="0.2px"
        >
          GitHub Repo Search
        </text>
        <rect x="0" y="86" width="230" height="4" rx="2" fill="#22c55e" />
      </g>
    </svg>
  );
}
