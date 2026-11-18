import { memo } from "react";
import { GRID, WORLD_H, WORLD_W } from "@/lib/city";

/* Deterministic pseudo random so server & client render identical SVG. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const RIVER =
  "M -50 780 C 250 700 450 860 750 760 S 1250 640 1300 1450";

function cubic(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

const riverPoints: number[][] = (() => {
  const pts: number[][] = [];
  const seg1 = [[-50, 780], [250, 700], [450, 860], [750, 760]];
  const seg2 = [[750, 760], [1050, 660], [1250, 640], [1300, 1450]];
  for (let i = 0; i <= 40; i++) pts.push(cubic(seg1[0], seg1[1], seg1[2], seg1[3], i / 40));
  for (let i = 1; i <= 60; i++) pts.push(cubic(seg2[0], seg2[1], seg2[2], seg2[3], i / 60));
  return pts;
})();

const PARKS: [number, number, number, number][] = [
  [450, 880, 260, 240],
  [1000, 600, 150, 100],
  [1500, 350, 200, 120],
  [100, 1150, 200, 150],
  [1550, 850, 100, 100],
];
const LAKE = { cx: 580, cy: 1010, rx: 95, ry: 55 };
const SEA = "M1850 1400 C1850 1280 1920 1220 2000 1180 V1400 Z";

function blocked(cx: number, cy: number) {
  for (const [x, y] of riverPoints) if (Math.hypot(cx - x, cy - y) < 44) return true;
  for (const [x, y, w, h] of PARKS) if (cx > x - 25 && cx < x + w + 25 && cy > y - 25 && cy < y + h + 25) return true;
  if (cx > 1830 && cy > 1180) return true;
  return false;
}

const isMajor = (v: number) => v % 200 === 0;

const geometry = (() => {
  const minor: string[] = [];
  const major: string[] = [];
  for (let x = 0; x <= WORLD_W; x += GRID) {
    (isMajor(x) ? major : minor).push(`M${x} 0V${WORLD_H}`);
  }
  for (let y = 0; y <= WORLD_H; y += GRID) {
    (isMajor(y) ? major : minor).push(`M0 ${y}H${WORLD_W}`);
  }

  const r = rng(42);
  const bldA: string[] = [];
  const bldB: string[] = [];
  for (let i = 0; i < WORLD_W / GRID; i++) {
    for (let j = 0; j < WORLD_H / GRID; j++) {
      const cx = i * GRID + GRID / 2;
      const cy = j * GRID + GRID / 2;
      if (blocked(cx, cy)) continue;
      const w = 15 + r() * 14;
      const h = 15 + r() * 14;
      const jx = (r() - 0.5) * 5;
      const jy = (r() - 0.5) * 5;
      const x = cx - w / 2 + jx;
      const y = cy - h / 2 + jy;
      const d = `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}z`;
      (r() > 0.5 ? bldA : bldB).push(d);
    }
  }

  const trees: { x: number; y: number; r: number }[] = [];
  for (const [x, y, w, h] of PARKS) {
    const n = Math.round((w * h) / 1800);
    for (let k = 0; k < n; k++) {
      trees.push({ x: x + 10 + r() * (w - 20), y: y + 10 + r() * (h - 20), r: 4 + r() * 5 });
    }
  }
  return {
    minor: minor.join(""),
    major: major.join(""),
    bldA: bldA.join(""),
    bldB: bldB.join(""),
    trees,
  };
})();

function BaseMapInner() {
  return (
    <g>
      <rect x={-200} y={-200} width={WORLD_W + 400} height={WORLD_H + 400} fill="var(--map-land)" />

      {/* buildings */}
      <path d={geometry.bldA} fill="var(--map-bld-a)" />
      <path d={geometry.bldB} fill="var(--map-bld-b)" />

      {/* roads */}
      <path d={geometry.minor} stroke="var(--map-casing)" strokeWidth={8.5} fill="none" />
      <path d={geometry.minor} stroke="var(--map-road)" strokeWidth={5.5} fill="none" />
      <path d={geometry.major} stroke="var(--map-casing)" strokeWidth={15} fill="none" />
      <path d={geometry.major} stroke="var(--map-road)" strokeWidth={11} fill="none" />

      {/* parks */}
      {PARKS.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={16} fill="var(--map-park)" />
      ))}
      {geometry.trees.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.r} fill="var(--map-tree)" />
      ))}
      <ellipse cx={LAKE.cx} cy={LAKE.cy} rx={LAKE.rx} ry={LAKE.ry} fill="var(--map-water-edge)" />
      <ellipse cx={LAKE.cx} cy={LAKE.cy} rx={LAKE.rx - 5} ry={LAKE.ry - 5} fill="var(--map-water)" />

      {/* river */}
      <path d={RIVER} fill="none" stroke="var(--map-water-edge)" strokeWidth={34} strokeLinecap="round" />
      <path d={RIVER} fill="none" stroke="var(--map-water)" strokeWidth={26} strokeLinecap="round" />

      {/* bridges: major roads redrawn above the river */}
      <mask id="bridge-mask" maskUnits="userSpaceOnUse" x={-100} y={-100} width={WORLD_W + 200} height={WORLD_H + 200}>
        <path d={RIVER} fill="none" stroke="#fff" strokeWidth={46} />
      </mask>
      <g mask="url(#bridge-mask)">
        <path d={geometry.major} stroke="var(--map-casing)" strokeWidth={15} fill="none" />
        <path d={geometry.major} stroke="var(--map-road)" strokeWidth={11} fill="none" />
      </g>

      {/* sea */}
      <path d={SEA} fill="var(--map-water-edge)" />
      <path d="M1862 1400 C1862 1288 1928 1232 2000 1196 V1400 Z" fill="var(--map-water)" />
    </g>
  );
}

const BaseMap = memo(BaseMapInner);
export default BaseMap;
