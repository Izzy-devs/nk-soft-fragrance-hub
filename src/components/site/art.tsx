/** Eight-pointed star lattice, the geometric motif of Arabian ornament. Decorative only. */
export function Lattice({ className = "", opacity = 0.14 }: { className?: string; opacity?: number }) {
  return (
    <svg aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }}>
      <defs>
        <pattern id="nk-lattice" width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#c8a96b" strokeWidth="1">
            <rect x="16" y="16" width="40" height="40" />
            <rect x="16" y="16" width="40" height="40" transform="rotate(45 36 36)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#nk-lattice)" />
    </svg>
  );
}

/** Line-drawn bottle used wherever a real product photo has not been uploaded yet. */
export function BottleArt({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const stroke = tone === "dark" ? "#c8a96b" : "#7a5f2a";
  return (
    <svg viewBox="0 0 200 260" role="img" aria-label="Perfume bottle illustration" className={className}>
      <g fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round">
        <rect x="86" y="14" width="28" height="34" rx="2" />
        <rect x="92" y="48" width="16" height="14" />
        <path d="M60 62h80a8 8 0 0 1 8 8v150a14 14 0 0 1-14 14H66a14 14 0 0 1-14-14V70a8 8 0 0 1 8-8Z" />
        <path d="M68 78h64" opacity=".6" />
        <g transform="translate(100 150)">
          <rect x="-20" y="-20" width="40" height="40" />
          <rect x="-20" y="-20" width="40" height="40" transform="rotate(45)" />
        </g>
      </g>
    </svg>
  );
}
