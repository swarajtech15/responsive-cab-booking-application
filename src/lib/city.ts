// Shared geometry, fare and driver logic for the SwiftCab city map.

export type Pt = { x: number; y: number };
export type Pose = Pt & { heading: number };

export const WORLD_W = 2000;
export const WORLD_H = 1400;
export const GRID = 50;
/** 100 world units == 1 km */
export const UNITS_PER_KM = 100;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const snap = (v: number) => Math.round(v / GRID) * GRID;
export const snapPt = (p: Pt): Pt => ({
  x: clamp(snap(p.x), GRID, WORLD_W - GRID),
  y: clamp(snap(p.y), GRID, WORLD_H - GRID),
});
export const samePt = (a: Pt | null, b: Pt | null) =>
  !!a && !!b && a.x === b.x && a.y === b.y;

export type Landmark = {
  id: string;
  name: string;
  area: string;
  icon: string;
  x: number;
  y: number;
};

export const LANDMARKS: Landmark[] = [
  { id: "station", name: "Central Station", area: "Old City", icon: "🚉", x: 400, y: 300 },
  { id: "airport", name: "Airport Terminal 2", area: "North East", icon: "✈️", x: 1800, y: 200 },
  { id: "tech", name: "Tech Park", area: "Innovation Hub", icon: "💻", x: 1500, y: 700 },
  { id: "mall", name: "City Centre Mall", area: "Downtown", icon: "🛍️", x: 900, y: 500 },
  { id: "lake", name: "Lake Gardens", area: "Green Belt", icon: "🌳", x: 600, y: 900 },
  { id: "uni", name: "Royal University", area: "Campus Road", icon: "🎓", x: 300, y: 1000 },
  { id: "bazaar", name: "Old Town Bazaar", area: "Heritage Quarter", icon: "🏮", x: 1000, y: 900 },
  { id: "stadium", name: "Skyline Stadium", area: "Sports Ave", icon: "🏟️", x: 1400, y: 1100 },
  { id: "hospital", name: "General Hospital", area: "Medical Row", icon: "🏥", x: 700, y: 250 },
  { id: "beach", name: "Beach Promenade", area: "Seafront", icon: "🏖️", x: 1800, y: 1250 },
  { id: "bkc", name: "Business District", area: "Financial Zone", icon: "🏢", x: 1150, y: 300 },
  { id: "fort", name: "Heritage Fort", area: "West Gate", icon: "🏰", x: 200, y: 600 },
];

export function nearestLandmark(p: Pt) {
  let best = LANDMARKS[0];
  let bestD = Infinity;
  for (const lm of LANDMARKS) {
    const d = Math.hypot(lm.x - p.x, lm.y - p.y);
    if (d < bestD) {
      bestD = d;
      best = lm;
    }
  }
  return { landmark: best, dist: bestD };
}

export function placeName(p: Pt) {
  const { landmark, dist } = nearestLandmark(p);
  return dist <= GRID / 2 ? landmark.name : `Near ${landmark.name}`;
}

export function km(a: Pt, b: Pt) {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) / UNITS_PER_KM;
}

/* ------------------------------ routing ------------------------------ */

function dedupe(pts: Pt[]) {
  return pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);
}

/** Manhattan style route along the road grid (L shaped or Z shaped). */
export function routeBetween(a: Pt, b: Pt): Pt[] {
  if (a.x === b.x || a.y === b.y) return dedupe([a, b]);
  const dy = Math.abs(a.y - b.y);
  const dx = Math.abs(a.x - b.x);
  if (dy >= 150 && dx >= 100) {
    const mid = snap((a.y + b.y) / 2);
    return dedupe([a, { x: a.x, y: mid }, { x: b.x, y: mid }, b]);
  }
  return dedupe([a, { x: b.x, y: a.y }, b]);
}

export function pathLength(pts: Pt[]) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

export function pointAt(pts: Pt[], t: number): Pose {
  if (pts.length === 0) return { x: 0, y: 0, heading: 0 };
  if (pts.length === 1) return { ...pts[0], heading: 0 };
  const total = pathLength(pts);
  let target = clamp(t, 0, 1) * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (target <= seg || i === pts.length - 1) {
      const f = seg === 0 ? 0 : Math.min(1, target / seg);
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        heading: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
      };
    }
    target -= seg;
  }
  return { ...pts[pts.length - 1], heading: 0 };
}

/** Path left to travel from progress t to the end. */
export function remainingPath(pts: Pt[], t: number): Pt[] {
  if (pts.length < 2) return pts;
  const total = pathLength(pts);
  let target = clamp(t, 0, 1) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (target <= seg) {
      const p = pointAt(pts, t);
      return [{ x: p.x, y: p.y }, ...pts.slice(i)];
    }
    target -= seg;
  }
  return [pts[pts.length - 1]];
}

export function estimateTrip(route: Pt[]) {
  const dist = Math.round((pathLength(route) / UNITS_PER_KM) * 10) / 10;
  const turns = Math.max(0, route.length - 2);
  const min = Math.max(4, Math.round((dist / 24) * 60 + turns * 0.7));
  return { km: dist, min };
}

/* ------------------------------- fares ------------------------------- */

export type CategoryId = "economy" | "comfort" | "premium";

export type Category = {
  id: CategoryId;
  name: string;
  model: string;
  seats: number;
  tagline: string;
  perks: string[];
  base: number;
  perKm: number;
  perMin: number;
  minFare: number;
  etaMin: number;
};

export const CATEGORIES: Category[] = [
  {
    id: "economy",
    name: "Economy",
    model: "Swift Mini · Hatchback",
    seats: 4,
    tagline: "Affordable everyday rides",
    perks: ["Budget friendly", "Quick pickup"],
    base: 35,
    perKm: 11,
    perMin: 1.2,
    minFare: 80,
    etaMin: 3,
  },
  {
    id: "comfort",
    name: "Comfort",
    model: "Sedan · AC · Extra legroom",
    seats: 4,
    tagline: "Spacious sedans, top-rated drivers",
    perks: ["Extra legroom", "Newer cars"],
    base: 55,
    perKm: 15,
    perMin: 1.6,
    minFare: 120,
    etaMin: 4,
  },
  {
    id: "premium",
    name: "Premium",
    model: "Luxury SUV · Chauffeur",
    seats: 6,
    tagline: "Luxury SUVs with chauffeurs",
    perks: ["Luxury fleet", "Water & Wi-Fi"],
    base: 90,
    perKm: 22,
    perMin: 2.5,
    minFare: 220,
    etaMin: 6,
  },
];

export const getCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export type FareBreakdown = {
  base: number;
  distance: number;
  time: number;
  taxes: number;
  adjustment: number;
  total: number;
};

export function calcFare(id: string, distanceKm: number, durationMin: number): FareBreakdown {
  const c = getCategory(id);
  const base = Math.round(c.base);
  const distance = Math.round(c.perKm * distanceKm);
  const time = Math.round(c.perMin * durationMin);
  const taxes = Math.round((base + distance + time) * 0.05);
  const sum = base + distance + time + taxes;
  const total = Math.max(c.minFare, sum);
  return { base, distance, time, taxes, adjustment: total - sum, total };
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export type PaymentId = "upi" | "card" | "cash" | "wallet";
export const PAYMENTS: { id: PaymentId; label: string }[] = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
  { id: "cash", label: "Cash" },
  { id: "wallet", label: "Wallet" },
];
export const paymentLabel = (id: string) =>
  PAYMENTS.find((p) => p.id === id)?.label ?? "Cash";

/* ------------------------------ drivers ------------------------------ */

export type Driver = {
  name: string;
  rating: number;
  trips: number;
  vehicle: string;
  color: string;
  plate: string;
  category: CategoryId;
  years: number;
};

export const DRIVERS: Driver[] = [
  { name: "Rajesh Kumar", rating: 4.8, trips: 3214, vehicle: "Maruti WagonR", color: "White", plate: "KA 01 MN 2043", category: "economy", years: 4 },
  { name: "Suresh Patil", rating: 4.7, trips: 2180, vehicle: "Hyundai Santro", color: "Silver", plate: "KA 03 HG 7781", category: "economy", years: 3 },
  { name: "Imran Shaikh", rating: 4.9, trips: 4102, vehicle: "Honda City", color: "Grey", plate: "KA 05 PQ 1190", category: "comfort", years: 6 },
  { name: "Vikram Singh", rating: 4.8, trips: 2764, vehicle: "Maruti Ciaz", color: "Blue", plate: "KA 02 RT 5532", category: "comfort", years: 5 },
  { name: "Arjun Mehta", rating: 4.97, trips: 5320, vehicle: "Toyota Innova Crysta", color: "Black", plate: "KA 51 AB 0007", category: "premium", years: 8 },
  { name: "Karan Malhotra", rating: 4.95, trips: 3890, vehicle: "Mercedes E-Class", color: "Black", plate: "KA 01 ZZ 0099", category: "premium", years: 7 },
];

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
