import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...p }: P & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Svg>
);
export const ClockIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </Svg>
);
export const UserIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6" />
  </Svg>
);
export const PinIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Svg>
);
export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const SwapIcon = (p: P) => (
  <Svg {...p}>
    <path d="M7 4v16M7 20l-3-3M7 20l3-3" />
    <path d="M17 20V4M17 4l-3 3M17 4l3 3" />
  </Svg>
);
export const PhoneIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Svg>
);
export const ChatIcon = (p: P) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z" />
  </Svg>
);
export const StarIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.7 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8L12 3Z" />
  </Svg>
);
export const SunIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);
export const MoonIcon = (p: P) => (
  <Svg {...p}>
    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </Svg>
);
export const PlusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const MinusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const LocateIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="12" cy="12" r="8" />
    <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
  </Svg>
);
export const ExpandIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Svg>
);
export const BackIcon = (p: P) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);
export const ChevronIcon = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const ShieldIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
export const UsersIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.4 3.2-5 6.5-5s5.7 1.6 6.5 5" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15.3c2 .7 3.3 2.3 3.8 4.7" />
  </Svg>
);
export const WalletIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h13v4" />
    <path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z" />
    <circle cx="16.5" cy="14.5" r="1" />
  </Svg>
);
export const BellIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);
export const GlobeIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </Svg>
);
export const LifebuoyIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="m5.6 5.6 3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9" />
  </Svg>
);
export const RouteIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="6" cy="19" r="2.5" />
    <circle cx="18" cy="5" r="2.5" />
    <path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
  </Svg>
);

/** Logo mark: small cab silhouette */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-xl text-onaccent ${className}`}
      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
    >
      <svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 16 6.5 10.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16" />
        <path d="M3.5 16h17v3h-17z" />
        <path d="M9 6h6" />
        <circle cx="7.5" cy="17.5" r=".6" fill="currentColor" />
        <circle cx="16.5" cy="17.5" r=".6" fill="currentColor" />
      </svg>
    </span>
  );
}

/** Side-view car illustration for ride category cards. */
export function CarSide({ kind, className = "" }: { kind: "economy" | "comfort" | "premium"; className?: string }) {
  const color = kind === "economy" ? "#f59e0b" : kind === "comfort" ? "#3b82f6" : "#1f2937";
  const trim = kind === "premium" ? "#fbbf24" : "#ffffff";
  const body =
    kind === "economy"
      ? "M6 40 8 32c.6-2 2-3 4-3.4l10-2.4 8-8c1-1 2.2-1.6 3.6-1.6h18c1.6 0 3 .8 4 2l6 8 7 1.6c2.4.6 3.4 2 3.4 4.4V40Z"
      : kind === "comfort"
        ? "M4 40v-6c0-2 1-3.2 3-3.8l13-3.2 9-8c1-.9 2.2-1.4 3.6-1.4h22c1.6 0 3 .8 4 2l6.4 8.4 9 1.8c2.4.5 3.6 2 3.6 4.4V40Z"
        : "M4 40v-8c0-2.4 1.2-3.8 3.4-4.4l9-2.4 5-8c.8-1.4 2.2-2.2 3.8-2.2h38c1.6 0 3 .8 4 2l5.6 7.6 8.2 2c2.4.6 3.8 2 3.8 4.4V40Z";
  return (
    <svg viewBox="0 0 96 52" className={className} aria-hidden="true">
      <ellipse cx="48" cy="46" rx="42" ry="3.2" fill="currentColor" opacity=".12" />
      <path d={body} fill={color} />
      <path
        d={
          kind === "premium"
            ? "M27 27l3.6-6.4c.4-.6 1-1 1.8-1h14.6V27Zm24 0v-7.4h13c.8 0 1.5.4 2 1l4.6 6.4Z"
            : "M26 27l6-7c.6-.6 1.2-1 2-1h12v8Zm24 0v-8h10.4c.8 0 1.6.4 2 1l5.4 7Z"
        }
        fill="#dbeafe"
        opacity=".92"
      />
      <rect x="6" y="36" width="84" height="2.2" rx="1" fill={trim} opacity=".55" />
      <circle cx="26" cy="41" r="7" fill="#111827" />
      <circle cx="26" cy="41" r="3" fill="#cbd5e1" />
      <circle cx="72" cy="41" r="7" fill="#111827" />
      <circle cx="72" cy="41" r="3" fill="#cbd5e1" />
      <rect x="86" y="31" width="5" height="3" rx="1.2" fill="#fde68a" />
    </svg>
  );
}
