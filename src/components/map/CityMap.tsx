"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import BaseMap from "./BaseMap";
import { LocateIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";
import { LANDMARKS, WORLD_H, WORLD_W, clamp, snapPt, type Pose, type Pt } from "@/lib/city";

type View = { x: number; y: number; k: number };
export type MapPadding = { top: number; right: number; bottom: number; left: number };

export type CityMapProps = {
  pickup: Pt | null;
  drop: Pt | null;
  /** Route polyline to render (already trimmed for progress). */
  route: Pt[] | null;
  /** Driver approach path (dashed). */
  approach: Pt[] | null;
  vehicle: Pose | null;
  /** When set, tapping the map picks a point. */
  pickEnabled: boolean;
  pickLabel: string;
  searching: boolean;
  focus: Pt[];
  fitKey: string;
  padding: MapPadding;
  onPick: (p: Pt) => void;
  onLocate: () => void;
};

const MIN_K = 0.28;
const MAX_K = 2.6;

const AMBIENT: { x: number; y: number; w: number; h: number; dur: number; delay: number; color: string; rev?: boolean }[] = [
  { x: 700, y: 400, w: 300, h: 200, dur: 46, delay: 0, color: "#f59e0b" },
  { x: 1200, y: 500, w: 350, h: 250, dur: 58, delay: 12, color: "#94a3b8", rev: true },
  { x: 300, y: 700, w: 250, h: 150, dur: 38, delay: 5, color: "#3b82f6" },
  { x: 1000, y: 1000, w: 400, h: 200, dur: 62, delay: 20, color: "#f59e0b" },
  { x: 1500, y: 150, w: 250, h: 200, dur: 44, delay: 8, color: "#ef4444", rev: true },
  { x: 500, y: 100, w: 250, h: 150, dur: 40, delay: 15, color: "#94a3b8" },
  { x: 800, y: 600, w: 150, h: 250, dur: 34, delay: 3, color: "#22c55e", rev: true },
  { x: 150, y: 1150, w: 200, h: 150, dur: 36, delay: 10, color: "#f59e0b" },
];

function CarShape({ color, glow = false }: { color: string; glow?: boolean }) {
  return (
    <g>
      {glow && <rect x={-19} y={-11} width={38} height={22} rx={8} fill={color} opacity={0.25} />}
      <rect x={-14} y={-7} width={28} height={14} rx={5} fill={color} stroke="#fff" strokeWidth={1.6} />
      <rect x={1} y={-5} width={7} height={10} rx={2} fill="#0f172a" opacity={0.75} />
      <rect x={-9} y={-5} width={6} height={10} rx={2} fill="#0f172a" opacity={0.45} />
      <rect x={12} y={-6} width={2.4} height={3} rx={1} fill="#fde68a" />
      <rect x={12} y={3} width={2.4} height={3} rx={1} fill="#fde68a" />
    </g>
  );
}

function fitView(points: Pt[], pad: MapPadding, w: number, h: number): View {
  const aw = Math.max(80, w - pad.left - pad.right);
  const ah = Math.max(80, h - pad.top - pad.bottom);
  if (points.length === 0) points = [{ x: WORLD_W / 2, y: WORLD_H / 2 }];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  let k: number;
  if (points.length === 1 || (bw < 60 && bh < 60)) k = 0.95;
  else k = clamp(Math.min((aw * 0.86) / bw, (ah * 0.8) / bh), MIN_K, 1.5);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { k, x: pad.left + aw / 2 - cx * k, y: pad.top + ah / 2 - cy * k };
}

export default function CityMap(props: CityMapProps) {
  const { pickup, drop, route, approach, vehicle, pickEnabled, pickLabel, searching, focus, fitKey, padding, onPick, onLocate } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 0.9 });
  const viewRef = useRef(view);
  const animRef = useRef(0);
  const firstFit = useRef(true);

  const commit = useCallback((v: View) => {
    viewRef.current = v;
    setView(v);
  }, []);

  /* ---------- size observer ---------- */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  /* ---------- animated view transitions ---------- */
  const animateTo = useCallback(
    (target: View, ms = 750) => {
      cancelAnimationFrame(animRef.current);
      const from = viewRef.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        commit({
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          k: from.k + (target.k - from.k) * e,
        });
        if (t < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    },
    [commit],
  );

  const latest = useRef({ focus, padding });
  useEffect(() => {
    latest.current = { focus, padding };
  });

  const padKey = `${padding.top}|${padding.right}|${padding.bottom}|${padding.left}`;
  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    const target = fitView(latest.current.focus, latest.current.padding, size.w, size.h);
    if (firstFit.current) {
      firstFit.current = false;
      commit(target);
    } else {
      animateTo(target);
    }
  }, [fitKey, padKey, size.w, size.h, animateTo, commit]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  /* ---------- gestures ---------- */
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{ sx: number; sy: number; moved: boolean; dist: number }>({ sx: 0, sy: 0, moved: false, dist: 0 });

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const v = viewRef.current;
      const k = clamp(v.k * factor, MIN_K, MAX_K);
      const r = k / v.k;
      commit({ k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r });
    },
    [commit],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(animRef.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { sx: e.clientX, sy: e.clientY, moved: false, dist: 0 };
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gesture.current.moved = true;
      gesture.current.dist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    const g = gesture.current;
    if (pointers.current.size === 1) {
      if (!g.moved && Math.hypot(cur.x - g.sx, cur.y - g.sy) > 6) g.moved = true;
      if (g.moved) {
        const v = viewRef.current;
        commit({ ...v, x: v.x + (cur.x - prev.x), y: v.y + (cur.y - prev.y) });
      }
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = e.currentTarget.getBoundingClientRect();
      if (g.dist > 0) zoomAt((a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top, dist / g.dist);
      g.dist = dist;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const had = pointers.current.has(e.pointerId);
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (!had) return;
    if (wasSingle && !gesture.current.moved && e.type === "pointerup" && pickEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const v = viewRef.current;
      onPick(snapPt({ x: (e.clientX - rect.left - v.x) / v.k, y: (e.clientY - rect.top - v.y) / v.k }));
    }
    if (pointers.current.size === 1) {
      const rest = Array.from(pointers.current.values())[0];
      gesture.current = { sx: rest.x, sy: rest.y, moved: true, dist: 0 };
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.0016));
  };

  const zoomBy = (f: number) => {
    cancelAnimationFrame(animRef.current);
    zoomAt(size.w / 2, size.h / 2, f);
  };

  const recenter = () => {
    animateTo(fitView(latest.current.focus, latest.current.padding, size.w, size.h));
  };

  /* ---------- derived ---------- */
  const inv = 1 / view.k;
  const carScale = clamp(inv * 0.72, 0.6, 2.4);
  const showLabels = view.k >= 0.46;

  const ambient = useMemo(
    () =>
      AMBIENT.map((a, i) => {
        const d = a.rev
          ? `M${a.x} ${a.y}v${a.h}h${a.w}v${-a.h}z`
          : `M${a.x} ${a.y}h${a.w}v${a.h}h${-a.w}z`;
        return { ...a, d, key: i };
      }),
    [],
  );

  const polyline = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={wrapRef}
        role="application"
        aria-label="Interactive city map. Drag to pan, scroll or pinch to zoom, tap to drop a pin."
        className={`absolute inset-0 touch-none select-none ${pickEnabled ? "cursor-crosshair" : "cursor-grab"} active:cursor-grabbing`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <svg width="100%" height="100%" className="block">
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            <BaseMap />

            {/* route */}
            {route && route.length > 1 && (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points={polyline(route)} vectorEffect="non-scaling-stroke" strokeWidth={9} style={{ stroke: "var(--glass-strong)" }} />
                <polyline points={polyline(route)} vectorEffect="non-scaling-stroke" strokeWidth={5.5} style={{ stroke: "var(--accent)" }} />
                <polyline points={polyline(route)} vectorEffect="non-scaling-stroke" strokeWidth={2.2} className="route-flow" style={{ stroke: "#fff" }} />
              </g>
            )}
            {approach && approach.length > 1 && (
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points={polyline(approach)} vectorEffect="non-scaling-stroke" strokeWidth={7} style={{ stroke: "var(--glass-strong)" }} />
                <polyline points={polyline(approach)} vectorEffect="non-scaling-stroke" strokeWidth={4} strokeDasharray="2 8" style={{ stroke: "var(--accent-2)" }} />
              </g>
            )}

            {/* ambient traffic */}
            {ambient.map((a) => (
              <g key={a.key}>
                <animateMotion dur={`${a.dur}s`} begin={`-${a.delay}s`} repeatCount="indefinite" rotate="auto" path={a.d} />
                <g transform={`scale(${carScale * 0.8})`} opacity={0.9}>
                  <CarShape color={a.color} />
                </g>
              </g>
            ))}

            {/* landmarks */}
            {LANDMARKS.map((lm) => (
              <g key={lm.id} transform={`translate(${lm.x} ${lm.y}) scale(${inv})`} pointerEvents="none">
                <circle r={12} style={{ fill: "var(--glass-strong)", stroke: "var(--line)" }} strokeWidth={1} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={13}>
                  {lm.icon}
                </text>
                {showLabels && (
                  <text
                    y={26}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    style={{ fill: "var(--fg)", stroke: "var(--map-halo)", paintOrder: "stroke", strokeWidth: 3.5, strokeLinejoin: "round" }}
                  >
                    {lm.name}
                  </text>
                )}
              </g>
            ))}

            {/* searching radar */}
            {searching && pickup && (
              <g transform={`translate(${pickup.x} ${pickup.y}) scale(${inv})`}>
                {[0, 1, 2].map((i) => (
                  <circle key={i} r={46} fill="none" strokeWidth={2} className="pulse-ring" style={{ stroke: "var(--accent)", animationDelay: `${i * 0.7}s` }} />
                ))}
              </g>
            )}

            {/* pickup pin */}
            {pickup && (
              <g transform={`translate(${pickup.x} ${pickup.y}) scale(${inv})`}>
                <g key={`${pickup.x}-${pickup.y}`} className="pin-drop">
                  <circle r={16} fill="#22c55e" opacity={0.22} className="pulse-ring" />
                  <circle r={11} fill="#fff" stroke="rgba(0,0,0,.12)" />
                  <circle r={6.5} fill="#22c55e" />
                  <g transform="translate(0 -26)">
                    <rect x={-27} y={-11} width={54} height={20} rx={10} style={{ fill: "var(--glass-strong)", stroke: "var(--line)" }} />
                    <text textAnchor="middle" y={3} fontSize={10.5} fontWeight={800} style={{ fill: "var(--fg)" }}>
                      Pickup
                    </text>
                  </g>
                </g>
              </g>
            )}

            {/* drop pin */}
            {drop && (
              <g transform={`translate(${drop.x} ${drop.y}) scale(${inv})`}>
                <g key={`${drop.x}-${drop.y}`} className="pin-drop">
                  <ellipse cy={1} rx={8} ry={3} fill="#000" opacity={0.2} />
                  <path
                    d="M0 0 C-8 -12 -15 -20 -15 -29 A15 15 0 1 1 15 -29 C15 -20 8 -12 0 0Z"
                    style={{ fill: "var(--accent)", stroke: "#fff" }}
                    strokeWidth={2}
                  />
                  <circle cy={-29} r={5.5} fill="#fff" />
                </g>
              </g>
            )}

            {/* live vehicle */}
            {vehicle && (
              <g transform={`translate(${vehicle.x} ${vehicle.y}) scale(${inv})`}>
                <circle r={26} className="pulse-ring" style={{ fill: "var(--accent)" }} opacity={0.35} />
                <g transform={`rotate(${vehicle.heading}) scale(1.35)`}>
                  <CarShape color="#111827" glow />
                  <rect x={-12} y={-1.4} width={22} height={2.8} rx={1.4} style={{ fill: "var(--accent)" }} />
                </g>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* map controls */}
      <div className="absolute right-3 top-[88px] z-20 flex flex-col gap-2 md:right-5 md:top-24">
        <div className="glass flex flex-col overflow-hidden rounded-2xl">
          <button type="button" onClick={() => zoomBy(1.35)} aria-label="Zoom in" className="grid h-11 w-11 place-items-center text-lg transition-colors hover:bg-accent/15 hover:text-accent active:scale-90">
            <PlusIcon />
          </button>
          <span className="mx-2 h-px bg-line" />
          <button type="button" onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out" className="grid h-11 w-11 place-items-center text-lg transition-colors hover:bg-accent/15 hover:text-accent active:scale-90">
            <MinusIcon />
          </button>
        </div>
        <button type="button" onClick={onLocate} aria-label="Use my current location as pickup" className="glass grid h-11 w-11 place-items-center rounded-2xl text-lg transition-all hover:scale-105 hover:text-accent active:scale-90">
          <LocateIcon />
        </button>
        <button type="button" onClick={recenter} aria-label="Fit route in view" className="glass grid h-11 w-11 place-items-center rounded-2xl text-[11px] font-extrabold transition-all hover:scale-105 hover:text-accent active:scale-90">
          FIT
        </button>
      </div>

      {pickEnabled && (
        <div className="pointer-events-none absolute left-1/2 top-[76px] z-20 hidden -translate-x-1/2 sm:block lg:left-[calc(50%+200px)] md:top-[84px]">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold" style={{ "--d": 0 } as CSSProperties}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            {pickLabel}
          </span>
        </div>
      )}
    </div>
  );
}
