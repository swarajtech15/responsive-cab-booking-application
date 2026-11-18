"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { formatINR, getCategory, paymentLabel, routeBetween, type Pt } from "@/lib/city";
import { summarize, updateBookingStatus, useBookings, type BookingStatus } from "@/lib/booking-storage";
import { CarSide, ChevronIcon, RouteIcon, StarIcon } from "@/components/ui/Icons";
import { FlipText, HoverText } from "@/components/ui/TextFx";

type Filter = "all" | BookingStatus;

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const statusClasses: Record<BookingStatus, string> = {
  confirmed: "bg-accent/15 text-accent",
  ongoing: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-500",
};

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

function RouteThumb({ a, b }: { a: Pt; b: Pt }) {
  const pts = routeBetween(a, b);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - minX, 50);
  const h = Math.max(Math.max(...ys) - minY, 50);
  const s = Math.min(52 / w, 36 / h);
  const ox = (72 - w * s) / 2;
  const oy = (56 - h * s) / 2;
  const map = (p: Pt) => `${(ox + (p.x - minX) * s).toFixed(1)},${(oy + (p.y - minY) * s).toFixed(1)}`;
  const first = map(pts[0]).split(",");
  const last = map(pts[pts.length - 1]).split(",");
  return (
    <svg viewBox="0 0 72 56" className="h-14 w-[72px] shrink-0 rounded-xl bg-chip" aria-hidden="true">
      <polyline points={pts.map(map).join(" ")} fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--accent)" }} />
      <circle cx={first[0]} cy={first[1]} r={3.6} fill="#22c55e" stroke="#fff" strokeWidth={1.2} />
      <circle cx={last[0]} cy={last[1]} r={3.6} style={{ fill: "var(--accent-2)" }} stroke="#fff" strokeWidth={1.2} />
    </svg>
  );
}

export default function HistoryClient() {
  const rides = useBookings();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");

  const stats = summarize(rides);
  const list = rides.filter((r) => filter === "all" || r.status === filter);
  const counts: Record<Filter, number> = { all: rides.length, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 };
  for (const ride of rides) counts[ride.status]++;

  function changeStatus(id: string, status: BookingStatus) {
    try {
      const booking = updateBookingStatus(id, status);
      setError("");
      setAnnouncement(`Ride to ${booking.dropName} is now ${booking.status}.`);
    } catch {
      setAnnouncement("");
      setError("Couldn't update this ride. Check its current status and try again.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-24 md:px-6 md:pb-16 md:pt-28">
      <header className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">Your trips</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <FlipText text="Ride History" intro />
        </h1>
        <p className="mt-1 text-muted">Every trip, fare and driver — all in one place.</p>
      </header>

      <section aria-label="Summary" className="mb-6 grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { l: "Total rides", v: String(stats.total), i: "🚖" },
          { l: "Total spent", v: formatINR(stats.spent), i: "💸" },
          { l: "Distance", v: `${stats.distance} km`, i: "🛣️" },
        ].map((s, i) => (
          <div key={s.l} className="glass lift fade-up rounded-3xl p-3.5 sm:p-5" style={{ "--d": i } as CSSProperties}>
            <span className="text-xl sm:text-2xl" aria-hidden="true">{s.i}</span>
            <p className="mt-1 truncate text-lg font-extrabold tabular-nums sm:text-3xl">
              <HoverText text={s.v} />
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted sm:text-xs">{s.l}</p>
          </div>
        ))}
      </section>

      <div className="glass mb-5 inline-flex max-w-full flex-wrap rounded-2xl p-1" role="group" aria-label="Filter rides">
        {filters.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={filter === t.id}
            onClick={() => { setFilter(t.id); setError(""); }}
            className={`group rounded-xl px-3.5 py-2 text-sm font-bold transition-all sm:px-5 ${
              filter === t.id ? "bg-accent text-onaccent shadow-lg" : "text-muted hover:text-fg"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${filter === t.id ? "bg-white/25" : "bg-chip"}`}>{counts[t.id]}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">{announcement}</p>
      {error && <p className="mb-4 text-sm font-semibold text-red-500" role="alert">{error}</p>}

      {list.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-4xl">🛺</p>
          <p className="mt-2 font-bold">{rides.length ? `No ${filter} rides` : "No rides here yet"}</p>
          {rides.length ? (
            <button type="button" onClick={() => setFilter("all")} className="btn-primary mt-4 rounded-2xl px-6 py-2.5 text-sm">
              Show all rides
            </button>
          ) : (
            <Link href="/home" className="btn-primary mt-4 inline-block rounded-2xl px-6 py-2.5 text-sm">
              Book a ride
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((r, i) => {
            const open = openId === r.id;
            const cat = getCategory(r.category);
            const d = new Date(r.createdAt);
            const cancelled = r.status === "cancelled";
            return (
              <li key={r.id} className="fade-up min-w-0" style={{ "--d": Math.min(i, 8) } as CSSProperties}>
                <article className="glass lift group rounded-3xl">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : r.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 rounded-3xl p-4 text-left"
                  >
                    <RouteThumb a={{ x: r.pickupX, y: r.pickupY }} b={{ x: r.dropX, y: r.dropY }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold">{r.pickupName}</span>
                      <span className="block truncate text-sm font-semibold text-muted">→ {r.dropName}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted">
                        <time dateTime={r.createdAt}>{dateFmt.format(d)} · {timeFmt.format(d)}</time>
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-accent">{cat.name}</span>
                      </span>
                      <span className="mt-1 block break-all text-[10px] font-semibold text-muted" aria-label={`Ride ID ${r.id}`}>{r.id}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`block text-lg font-extrabold tabular-nums ${cancelled ? "text-muted line-through" : ""}`}>{formatINR(r.fare)}</span>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${statusClasses[r.status]}`}>
                        {r.status}
                      </span>
                    </span>
                    <ChevronIcon className={`shrink-0 text-lg text-muted transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="sheet-in space-y-3 border-t border-line px-4 pb-4 pt-3">
                      <div className="flex items-center gap-3">
                        <CarSide kind={cat.id} className="w-16 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold">{r.driverName}</p>
                          <p className="truncate text-xs text-muted">{r.vehicle}</p>
                        </div>
                        <span className="rounded-lg border-2 border-amber-500 bg-amber-300 px-2 py-0.5 text-[11px] font-extrabold tracking-wider text-black">{r.plate}</span>
                      </div>
                      <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-chip py-2">
                          <dt className="flex items-center justify-center gap-1 font-bold uppercase text-muted"><RouteIcon /> Distance</dt>
                          <dd className="text-sm font-extrabold">{r.distanceKm} km</dd>
                        </div>
                        <div className="rounded-xl bg-chip py-2">
                          <dt className="font-bold uppercase text-muted">Duration</dt>
                          <dd className="text-sm font-extrabold">{r.durationMin} min</dd>
                        </div>
                        <div className="rounded-xl bg-chip py-2">
                          <dt className="font-bold uppercase text-muted">Payment</dt>
                          <dd className="text-sm font-extrabold">{paymentLabel(r.paymentMethod)}</dd>
                        </div>
                      </dl>
                      {r.status === "completed" && (
                        <div className="flex items-center justify-between text-xs font-semibold text-muted">
                          <span>Your rating</span>
                          <span className="flex gap-0.5 text-base text-amber-400" aria-label={`${r.rating ?? 0} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <StarIcon key={n} filled={n <= (r.rating ?? 0)} className={n <= (r.rating ?? 0) ? "" : "text-muted/40"} />
                            ))}
                          </span>
                        </div>
                      )}
                      {(r.status === "confirmed" || r.status === "ongoing") && (
                        <div className="flex flex-wrap gap-2">
                          {r.status === "confirmed" && (
                            <button type="button" onClick={() => changeStatus(r.id, "cancelled")} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/20">
                              Cancel ride
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => changeStatus(r.id, r.status === "confirmed" ? "ongoing" : "completed")}
                            className="btn-primary flex-1 rounded-xl px-3 py-2.5 text-sm"
                          >
                            {r.status === "confirmed" ? "Start ride" : "Complete ride"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
