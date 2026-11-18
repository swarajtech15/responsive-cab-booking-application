"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { FlipText, FlipWords } from "@/components/ui/TextFx";
import { LogoMark } from "@/components/ui/Icons";

const DURATION = 3600;
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

function Cab() {
  return (
    <svg viewBox="0 0 220 96" className="h-full w-full drop-shadow-[0_10px_14px_rgba(0,0,0,0.25)]" aria-hidden="true">
      <defs>
        <linearGradient id="cabBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="cabGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <g className="cab-bounce">
        {/* roof sign */}
        <rect x="92" y="1" width="38" height="11" rx="3" fill="#111827" />
        <text x="111" y="9.4" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fde047" fontFamily="system-ui, sans-serif">
          CAB
        </text>
        {/* cabin */}
        <path d="M46 44 66 17c2-3 4.5-4.5 8-4.5h62c3.6 0 6.4 1.6 8.4 4.5L168 44Z" fill="url(#cabBody)" />
        <path d="M60 42 74 22c1-1.6 2.4-2.4 4.2-2.4H101V42Z" fill="url(#cabGlass)" />
        <path d="M108 42V19.6h27.6c1.8 0 3.2.8 4.4 2.4L154 42Z" fill="url(#cabGlass)" />
        {/* body */}
        <rect x="8" y="40" width="206" height="32" rx="12" fill="url(#cabBody)" />
        {/* checker stripe */}
        <rect x="14" y="54" width="194" height="6" fill="#111827" opacity=".9" />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={14 + i * 8.1} y={i % 2 ? 54 : 57} width="8.1" height="3" fill="#fde047" />
        ))}
        <rect x="204" y="46" width="9" height="7" rx="3" fill="#fff7c2" />
        <rect x="8" y="46" width="7" height="7" rx="3" fill="#ef4444" />
        <rect x="108" y="44" width="10" height="3" rx="1.5" fill="#92400e" opacity=".6" />
      </g>
      {/* wheels */}
      {[56, 166].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="72" r="16" fill="#111827" />
          <g className="wheel-spin">
            <circle cx={cx} cy="72" r="9" fill="#cbd5e1" />
            <path d={`M${cx} 63v18M${cx - 9} 72h18M${cx - 6.4} 65.6l12.8 12.8M${cx + 6.4} 65.6l-12.8 12.8`} stroke="#64748b" strokeWidth="1.6" />
            <circle cx={cx} cy="72" r="2.6" fill="#334155" />
          </g>
        </g>
      ))}
    </svg>
  );
}

function Skyline({ shift = 0, opacity = 0.18, height = 120 }: { shift?: number; opacity?: number; height?: number }) {
  const buildings = [
    [0, 50, 34], [40, 78, 28], [74, 40, 36], [116, 92, 30], [152, 60, 40], [198, 84, 26],
    [230, 46, 34], [270, 98, 32], [308, 66, 30], [344, 54, 38], [388, 88, 28], [422, 70, 34],
  ];
  const w = 460;
  return (
    <svg
      viewBox={`0 0 ${w * 2} ${height}`}
      preserveAspectRatio="none"
      className="skyline-move absolute bottom-0 left-0 h-full w-[200%]"
      style={{ opacity, animationDuration: `${14 + shift}s` } as CSSProperties}
      aria-hidden="true"
    >
      {[0, w].map((off) =>
        buildings.map(([x, h, bw], i) => (
          <rect key={`${off}-${i}`} x={x + off} y={height - h} width={bw} height={h} rx="3" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

export default function CabLoader() {
  const router = useRouter();
  const [p, setP] = useState(0);

  useEffect(() => {
    router.prefetch("/home");
    const t0 = performance.now();
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      setP(ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else timer = setTimeout(() => router.replace("/home"), 450);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  const pct = Math.round(p * 100);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      {/* clouds */}
      <div className="pointer-events-none absolute inset-x-0 top-[12%] text-fg opacity-[0.07]" aria-hidden="true">
        <div className="cloud-drift h-10 w-40 rounded-full bg-current" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[26%] text-fg opacity-[0.05]" aria-hidden="true">
        <div className="cloud-drift h-14 w-56 rounded-full bg-current" style={{ animationDelay: "-18s", animationDuration: "55s" }} />
      </div>

      {/* skyline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34vh] text-accent" aria-hidden="true">
        <Skyline opacity={0.1} height={140} shift={10} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] text-fg" aria-hidden="true">
        <Skyline opacity={0.07} height={100} />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="fade-up mb-3 flex items-center gap-3">
          <LogoMark className="h-12 w-12 shadow-lg" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <FlipText text="SwiftCab" intro />
          </h1>
        </div>
        <p className="fade-up mb-12 text-base text-muted sm:text-lg" style={{ "--d": 4 } as CSSProperties}>
          Your city, <span className="font-bold text-accent"><FlipWords words={["on demand", "on time", "in comfort", "in a flash"]} /></span>
        </p>

        {/* cab lane */}
        <div className="glass relative w-[min(92vw,720px)] rounded-3xl px-4 pb-6 pt-8 sm:px-8">
          <div className="relative h-[84px] w-full sm:h-[104px]">
            <div
              className="absolute bottom-0 h-[72px] w-[165px] sm:h-[96px] sm:w-[220px]"
              style={{
                left: `calc((100% - var(--cab-w)) * ${p})`,
                ["--cab-w" as string]: "clamp(165px, 30vw, 220px)",
              }}
            >
              {/* speed lines behind the cab */}
              <div className="absolute -left-2 top-[40%]" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="speed-line"
                    style={{ "--d": i, width: 34 - i * 6, top: i * 11 - 10, right: 0 } as CSSProperties}
                  />
                ))}
              </div>
              <Cab />
            </div>
          </div>
          {/* road */}
          <div className="road-dash h-[3px] w-full rounded-full" aria-hidden="true" />

          {/* loading line */}
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-chip"
            role="progressbar"
            aria-label="Loading SwiftCab"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div
              className="relative h-full rounded-full"
              style={{
                width: `${p * 100}%`,
                background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                boxShadow: "0 0 18px color-mix(in srgb, var(--accent) 70%, transparent)",
              }}
            >
              <span className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_var(--accent)]" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted sm:text-sm">
            <span aria-live="polite">
              {pct < 35 ? "Warming up the engine…" : pct < 75 ? "Finding cabs near you…" : pct < 100 ? "Almost ready…" : "Let's go!"}
            </span>
            <span className="tabular-nums text-fg">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
