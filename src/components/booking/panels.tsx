"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  LANDMARKS,
  PAYMENTS,
  formatINR,
  initials,
  km,
  paymentLabel,
  samePt,
  type CategoryId,
  type FareBreakdown,
  type Landmark,
  type PaymentId,
  type Pt,
} from "@/lib/city";
import { FlipText, FlipWords, HoverText } from "@/components/ui/TextFx";
import {
  BackIcon,
  CarSide,
  CheckIcon,
  ChevronIcon,
  ChatIcon,
  PhoneIcon,
  PinIcon,
  SearchIcon,
  ShieldIcon,
  StarIcon,
  SwapIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import type { ActiveRide, Status } from "./types";

/* ============================ 1. SELECT ============================ */

export function SelectPanel(props: {
  pickup: Pt | null;
  drop: Pt | null;
  pickupName: string;
  dropName: string;
  target: "pickup" | "drop";
  setTarget: (t: "pickup" | "drop") => void;
  onPickLandmark: (lm: Landmark) => void;
  onSwap: () => void;
  onContinue: () => void;
}) {
  const { pickup, drop, pickupName, dropName, target, setTarget, onPickLandmark, onSwap, onContinue } = props;
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? LANDMARKS.filter((l) => l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q))
      : LANDMARKS.slice(0, 6);
    return list;
  }, [query]);

  const ready = !!pickup && !!drop && !samePt(pickup, drop);
  const rows = [
    { id: "pickup" as const, label: "Pickup", name: pickupName, set: !!pickup },
    { id: "drop" as const, label: "Drop-off", name: dropName, set: !!drop },
  ];

  return (
    <div className="sheet-in space-y-4">
      <div>
        <p className="text-sm font-medium text-muted">
          Ride in <span className="font-extrabold text-accent"><FlipWords words={["Economy", "Comfort", "Premium"]} /></span> style
        </p>
        <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight">
          <HoverText text="Where to, MasterAsh?" />
        </h1>
      </div>

      <div className="glass-soft relative rounded-2xl p-1.5" role="group" aria-label="Pickup and drop-off locations">
        {rows.map((r, idx) => {
          const active = target === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTarget(r.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 pr-12 text-left transition-all ${
                active ? "bg-bg/80 shadow-md ring-2 ring-accent" : "hover:bg-bg/50"
              } ${idx === 0 ? "mb-1" : ""}`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${r.id === "pickup" ? "bg-green-500/15 text-green-500" : "bg-accent/15 text-accent"}`}>
                {r.id === "pickup" ? <span className="h-3 w-3 rounded-full bg-green-500" /> : <PinIcon className="text-lg" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-muted">{r.label}</span>
                <span className={`block truncate text-sm font-semibold ${r.set ? "" : "text-muted"}`}>
                  {r.set ? r.name : "Tap the map or search below"}
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onSwap}
          disabled={!pickup || !drop}
          aria-label="Swap pickup and drop-off"
          className="glass absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full transition-all hover:rotate-180 hover:text-accent disabled:opacity-40"
        >
          <SwapIcon />
        </button>
      </div>

      <p className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent" role="status">
        <PinIcon className="shrink-0 text-base" />
        Tap anywhere on the map to drop the {target === "pickup" ? "pickup" : "drop-off"} pin.
      </p>

      <div>
        <label className="glass-soft flex items-center gap-2 rounded-2xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-accent">
          <SearchIcon className="text-lg text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${target === "pickup" ? "pickup" : "drop-off"} places`}
            aria-label="Search places"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted"
          />
        </label>
        <p className="mb-1.5 mt-3 text-[10px] font-extrabold uppercase tracking-widest text-muted">
          {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular places"}
        </p>
        <ul className="space-y-1">
          {results.map((lm) => (
            <li key={lm.id}>
              <button
                type="button"
                onClick={() => {
                  onPickLandmark(lm);
                  setQuery("");
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all hover:translate-x-1 hover:bg-accent/10"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-chip text-lg transition-transform group-hover:scale-110 group-hover:rotate-6">
                  {lm.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{lm.name}</span>
                  <span className="block truncate text-xs text-muted">{lm.area}</span>
                </span>
                {pickup && <span className="text-xs font-bold text-muted">{km(pickup, lm).toFixed(1)} km</span>}
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-2 py-3 text-sm text-muted">No places match “{query}”.</li>}
        </ul>
      </div>

      <button type="button" onClick={onContinue} disabled={!ready} className="btn-primary group w-full rounded-2xl py-3.5 text-base">
        {ready ? "See ride options & fares" : drop ? "Pick a different drop-off" : "Choose a drop-off to continue"}
      </button>
    </div>
  );
}

/* ============================ 2. CHOOSE ============================ */

export function ChoosePanel(props: {
  pickupName: string;
  dropName: string;
  km: number;
  min: number;
  quotes: Record<CategoryId, FareBreakdown>;
  category: CategoryId;
  setCategory: (c: CategoryId) => void;
  payment: PaymentId;
  setPayment: (p: PaymentId) => void;
  onBack: () => void;
  onBook: () => void;
}) {
  const { pickupName, dropName, quotes, category, setCategory, payment, setPayment, onBack, onBook } = props;
  const [open, setOpen] = useState(false);
  const sel = CATEGORIES.find((c) => c.id === category)!;
  const q = quotes[category];

  return (
    <div className="sheet-in space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to location selection" className="glass-soft grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg transition-all hover:-translate-x-0.5 hover:text-accent">
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold tracking-tight">
            <HoverText text="Choose your ride" />
          </h2>
          <p className="truncate text-xs font-medium text-muted">
            {pickupName} → {dropName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Distance", v: `${props.km} km` },
          { l: "Duration", v: `${props.min} min` },
          { l: "Arrival", v: "Fast route" },
        ].map((s) => (
          <div key={s.l} className="glass-soft rounded-2xl px-2 py-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">{s.l}</p>
            <p className="text-sm font-extrabold">{s.v}</p>
          </div>
        ))}
      </div>

      <div role="radiogroup" aria-label="Ride category" className="space-y-2.5">
        {CATEGORIES.map((c, i) => {
          const active = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCategory(c.id)}
              style={{ "--d": i } as React.CSSProperties}
              className={`fade-up group relative flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                active
                  ? "border-accent bg-accent/10 shadow-[0_8px_28px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
                  : "border-line bg-chip hover:border-accent/50"
              }`}
            >
              <span className="relative grid h-14 w-[84px] shrink-0 place-items-center rounded-xl bg-bg/60 text-fg">
                <CarSide kind={c.id} className="w-[76px] transition-transform duration-500 group-hover:translate-x-1.5 group-hover:scale-110" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-base font-extrabold">
                    <FlipText text={c.name} />
                  </span>
                  <span className="flex items-center gap-0.5 rounded-full bg-chip px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    <UsersIcon className="text-xs" />
                    {c.seats}
                  </span>
                </span>
                <span className="block truncate text-xs text-muted">{c.tagline}</span>
                <span className="mt-0.5 block text-xs font-bold text-accent">{c.etaMin} min away</span>
              </span>
              <span className="text-right">
                <span className="block text-lg font-extrabold tabular-nums">{formatINR(quotes[c.id].total)}</span>
                <span className="block text-[10px] font-semibold text-muted">incl. taxes</span>
              </span>
              {active && (
                <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-sm text-onaccent shadow-md">
                  <CheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="glass-soft rounded-2xl">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
        >
          <span>Fare details · {sel.name}</span>
          <ChevronIcon className={`text-lg transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <dl className="space-y-1.5 border-t border-line px-4 py-3 text-sm">
            <Row l="Base fare" v={formatINR(q.base)} />
            <Row l="Distance charge" v={formatINR(q.distance)} />
            <Row l="Time charge" v={formatINR(q.time)} />
            <Row l="Taxes & fees (5%)" v={formatINR(q.taxes)} />
            {q.adjustment > 0 && <Row l="Minimum fare adjustment" v={formatINR(q.adjustment)} />}
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatINR(q.total)}</dd>
            </div>
          </dl>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted">Pay with</p>
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Payment method">
          {PAYMENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={payment === p.id}
              onClick={() => setPayment(p.id)}
              className={`group rounded-xl border py-2 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                payment === p.id ? "border-accent bg-accent/15 text-accent" : "border-line bg-chip"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={onBook} className="btn-primary w-full rounded-2xl py-3.5 text-base">
        Book {sel.name} · {formatINR(q.total)}
      </button>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{l}</dt>
      <dd className="font-semibold text-fg tabular-nums">{v}</dd>
    </div>
  );
}

/* ============================ 3. SEARCHING ============================ */

export function SearchingPanel({ onCancel, categoryName, rideId }: { onCancel: () => void; categoryName: string; rideId: string }) {
  return (
    <div className="sheet-in flex flex-col items-center space-y-5 py-4 text-center">
      <div className="relative grid h-40 w-40 place-items-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="radar-ring" style={{ "--d": i } as React.CSSProperties} />
        ))}
        <span className="glass relative grid h-24 w-24 place-items-center rounded-full">
          <CarSide kind="comfort" className="w-16" />
        </span>
      </div>
      <div role="status" aria-live="polite">
        <h2 className="text-2xl font-extrabold tracking-tight">
          <FlipText text="Finding your driver" intro />
        </h2>
        <p className="mt-1 break-all text-xs font-semibold text-muted">Booking confirmed · {rideId}</p>
        <p className="mt-1 text-sm font-medium text-muted">
          <FlipWords words={[`Scanning ${categoryName} cabs nearby…`, "Matching the best-rated driver…", "Confirming your pickup…"]} interval={900} />
        </p>
      </div>
      <button type="button" onClick={onCancel} className="glass-soft rounded-2xl px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:text-red-500">
        Cancel request
      </button>
    </div>
  );
}

/* ============================ 4. LIVE RIDE ============================ */

const STEPS: { id: Status; label: string; sub: string }[] = [
  { id: "searching", label: "Ride confirmed", sub: "Driver assigned" },
  { id: "arriving", label: "Driver on the way", sub: "Heading to your pickup" },
  { id: "arrived", label: "Driver arrived", sub: "Share your OTP to start" },
  { id: "ontrip", label: "Trip in progress", sub: "Heading to drop-off" },
  { id: "completed", label: "Reached destination", sub: "Pay & rate your driver" },
];
const ORDER: Status[] = ["searching", "arriving", "arrived", "ontrip", "completed"];

export function RidePanel(props: {
  status: Status;
  ride: ActiveRide;
  progress: number;
  onCancel: () => void;
  notify: (m: string) => void;
}) {
  const { status, ride, progress, onCancel, notify } = props;
  const cat = CATEGORIES.find((c) => c.id === ride.category)!;
  const stepIdx = ORDER.indexOf(status);

  let title = "";
  let detail = "";
  let pct = 0;
  if (status === "arriving") {
    const eta = Math.max(1, Math.ceil(ride.approachMin * (1 - progress)));
    title = "Driver is arriving";
    detail = `${eta} min away`;
    pct = progress;
  } else if (status === "arrived") {
    title = "Your driver has arrived";
    detail = "Waiting at pickup";
    pct = 1;
  } else {
    const eta = Math.max(1, Math.ceil(ride.min * (1 - progress)));
    const left = Math.max(0, ride.km * (1 - progress));
    title = "On the way to drop-off";
    detail = `${eta} min · ${left.toFixed(1)} km left`;
    pct = progress;
  }

  return (
    <div className="sheet-in space-y-4">
      <div
        className="relative overflow-hidden rounded-2xl p-4 text-onaccent"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        role="status"
        aria-live="polite"
      >
        <p className="break-all text-[10px] font-extrabold uppercase tracking-widest opacity-80">Live status · {ride.id}</p>
        <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
        <p className="text-sm font-semibold opacity-90">{detail}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20" aria-hidden="true">
          <div className="h-full rounded-full bg-white/90 transition-[width] duration-200" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
      </div>

      {status !== "ontrip" && (
        <div className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldIcon className="text-lg text-accent" />
            Share OTP with driver
          </div>
          <div className="flex gap-1" aria-label={`OTP ${ride.otp.split("").join(" ")}`}>
            {ride.otp.split("").map((d, i) => (
              <span key={i} className="grid h-9 w-8 place-items-center rounded-lg bg-bg/80 text-lg font-extrabold shadow-sm">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* driver */}
      <div className="glass-soft rounded-2xl p-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-lg font-extrabold text-onaccent">
              {initials(ride.driver.name)}
            </span>
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-bg bg-green-500 text-[10px] text-white">
              <CheckIcon />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold">
              <HoverText text={ride.driver.name} />
            </p>
            <p className="flex items-center gap-1 text-xs font-semibold text-muted">
              <StarIcon filled className="text-amber-400" />
              <b className="text-fg">{ride.driver.rating}</b> · {ride.driver.trips.toLocaleString("en-IN")} trips · {ride.driver.years} yrs
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => notify(`Calling ${ride.driver.name.split(" ")[0]}…`)} aria-label="Call driver" className="grid h-10 w-10 place-items-center rounded-xl bg-green-500/15 text-lg text-green-500 transition-all hover:scale-110 active:scale-90">
              <PhoneIcon />
            </button>
            <button type="button" onClick={() => notify("Message sent to your driver")} aria-label="Message driver" className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-lg text-accent transition-all hover:scale-110 active:scale-90">
              <ChatIcon />
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-bg/60 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{ride.driver.vehicle}</p>
            <p className="text-xs text-muted">
              {ride.driver.color} · {cat.name}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border-2 border-amber-500 bg-amber-300 px-2.5 py-1 text-xs font-extrabold tracking-wider text-black shadow-sm">
            {ride.driver.plate}
          </span>
        </div>
      </div>

      {/* timeline */}
      <ol className="space-y-0.5" aria-label="Ride progress">
        {STEPS.slice(0, 4).map((s, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          return (
            <li key={s.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs transition-all ${
                    done ? "bg-accent text-onaccent" : current ? "bg-accent/20 text-accent ring-2 ring-accent" : "bg-chip text-muted"
                  }`}
                >
                  {done ? <CheckIcon /> : current ? <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> : i + 1}
                </span>
                {i < 3 && <span className={`my-0.5 h-5 w-0.5 rounded ${done ? "bg-accent" : "bg-line"}`} />}
              </div>
              <div className={`pb-1 ${current || done ? "" : "opacity-55"}`}>
                <p className="text-sm font-bold leading-6">{s.label}</p>
                {current && <p className="text-xs text-muted">{s.sub}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="glass-soft flex items-center justify-between rounded-2xl px-4 py-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Fare · {paymentLabel(ride.payment)}</p>
          <p className="text-xl font-extrabold tabular-nums">{formatINR(ride.fare.total)}</p>
        </div>
        <div className="text-right text-xs font-semibold text-muted">
          <p className="truncate">{ride.pickupName}</p>
          <p className="truncate">→ {ride.dropName}</p>
        </div>
      </div>

      {(status === "arriving" || status === "arrived") && (
        <button type="button" onClick={onCancel} className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-[0.98]">
          Cancel ride
        </button>
      )}
    </div>
  );
}

/* ============================ 5. DONE ============================ */

export function DonePanel(props: {
  ride: ActiveRide;
  rating: number;
  onRate: (n: number) => void;
  onNew: () => void;
}) {
  const { ride, rating, onRate, onNew } = props;
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  return (
    <div className="sheet-in space-y-4 text-center">
      <div className="pt-1">
        <div className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-full bg-green-500/15 text-3xl text-green-500">
          <CheckIcon className="pin-drop" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          <FlipText text="You've arrived!" intro />
        </h2>
        <p className="text-sm font-medium text-muted">Thanks for riding with SwiftCab, MasterAsh.</p>
        <p className="mt-1 break-all text-xs font-semibold text-muted">{ride.id}</p>
      </div>

      <div className="glass-soft rounded-2xl p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Total fare · {paymentLabel(ride.payment)}</p>
        <p className="text-4xl font-extrabold tabular-nums text-gradient">{formatINR(ride.fare.total)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-xl bg-bg/60 py-2">
            <p className="font-extrabold">{ride.km} km</p>
            <p className="text-[10px] font-bold uppercase text-muted">Distance</p>
          </div>
          <div className="rounded-xl bg-bg/60 py-2">
            <p className="font-extrabold">{ride.min} min</p>
            <p className="text-[10px] font-bold uppercase text-muted">Duration</p>
          </div>
          <div className="rounded-xl bg-bg/60 py-2">
            <p className="font-extrabold">{CATEGORIES.find((c) => c.id === ride.category)?.name}</p>
            <p className="text-[10px] font-bold uppercase text-muted">Ride</p>
          </div>
        </div>
      </div>

      <div className="glass-soft rounded-2xl p-4">
        <p className="text-sm font-bold">How was your ride with {ride.driver.name.split(" ")[0]}?</p>
        <div className="mt-2 flex justify-center gap-1" role="radiogroup" aria-label="Rate your driver">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onRate(n)}
              className={`text-4xl transition-all duration-200 hover:scale-125 hover:-rotate-12 active:scale-90 ${
                n <= shown ? "text-amber-400" : "text-muted/40"
              }`}
            >
              <StarIcon filled={n <= shown} />
            </button>
          ))}
        </div>
        <p className="mt-1 h-4 text-xs font-semibold text-muted" aria-live="polite">
          {rating ? "Thanks for your feedback!" : "Tap a star to rate"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/history" className="glass-soft rounded-2xl py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:text-accent">
          View history
        </Link>
        <button type="button" onClick={onNew} className="btn-primary rounded-2xl py-3 text-sm">
          Book another ride
        </button>
      </div>
    </div>
  );
}
