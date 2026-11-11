// Line icons: 1.5px stroke, currentColor, 24 grid. Decorative (aria-hidden).
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Crate with a snowflake: importing cold-chain medicines. */
export function ImportIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8 6V4h8v2" vectorEffect="non-scaling-stroke" />
      <rect x="3" y="6" width="18" height="14" rx="1.5" vectorEffect="non-scaling-stroke" />
      <path d="M12 8.5v9M8.1 10.75l7.8 4.5M8.1 15.25l7.8-4.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Flask: active ingredients and excipients. */
export function ApiIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M9 3h6M10 3v6l-5.2 9.1a1.5 1.5 0 0 0 1.3 2.4h11.8a1.5 1.5 0 0 0 1.3-2.4L14 9V3M7.6 15h8.8"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Points toward the end side (right in LTR). Add flip-rtl. Use back for the start side. */
export function ArrowIcon({ className, back }: IconProps & { back?: boolean }) {
  return (
    <svg {...base} className={className}>
      <path d={back ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20l1.3-4.2A8 8 0 1 1 8.2 18.8L4 20z" />
    </svg>
  );
}
