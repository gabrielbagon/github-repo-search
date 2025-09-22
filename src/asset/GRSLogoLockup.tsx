import * as React from "react";

type GRSLockupProps = {
  mode?: "light" | "dark";
  accent?: string;
  /** Largura total do logo (a altura ajusta automaticamente) */
  width?: number | string;
  title?: string;
  desc?: string;
  className?: string;
} & React.SVGProps<SVGSVGElement>;

export const GRSLogoLockup: React.FC<GRSLockupProps> = ({
  mode = "dark",
  accent = "#22c55e",
  width = 300,
  title = "GitHub Repo Search — Logo",
  desc = "Logo horizontal com ícone de grafo de commits e lupa seguido do nome do projeto.",
  className,
  ...svgProps
}) => {
  const titleId = React.useId();
  const descId = React.useId();

  const strokeColor = mode === "dark" ? "#e5e7eb" : "#0f172a";
  const style = {
    color: strokeColor,
    ["--accent" as any]: accent,
  } as React.CSSProperties;

  return (
    <svg
      width={width}
      viewBox="0 0 520 128"
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      style={style}
      className={className}
      {...svgProps}
    >
      <title id={titleId}>{title}</title>
      <desc id={descId}>{desc}</desc>

      {/* Ícone */}
      <g transform="translate(0,0)">
        <line x1={40} y1={20} x2={40} y2={108} stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
        <circle cx={40} cy={28} r={10} fill="none" stroke="currentColor" strokeWidth={8} />
        <circle cx={40} cy={64} r={10} fill="var(--accent)" />
        <circle cx={40} cy={100} r={10} fill="none" stroke="currentColor" strokeWidth={8} />
        <circle cx={80} cy={64} r={24} fill="none" stroke="currentColor" strokeWidth={8} />
        <line x1={97} y1={81} x2={114} y2={98} stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
      </g>

      {/* Wordmark */}
      <g transform="translate(140,0)">
        <text
          x={0}
          y={74}
          fontSize={36}
          fontWeight={600}
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fill="currentColor"
          letterSpacing="0.2px"
        >
          GitHub Repo Search
        </text>
        <rect x={0} y={86} width={230} height={4} fill="var(--accent)" rx={2} />
      </g>
    </svg>
  );
};
