"use client";

import type { CSSProperties } from "react";
import { summarize, useBookings } from "@/lib/booking-storage";
import { formatINR } from "@/lib/city";

export default function ProfileStats() {
  const stats = summarize(useBookings());
  const items = [
    { label: "Rides", value: String(stats.completed) },
    { label: "Spent", value: formatINR(stats.spent) },
    { label: "Distance", value: `${stats.distance} km` },
    { label: "Rating", value: stats.avgRating ? `${stats.avgRating} ★` : "—" },
  ];

  return (
    <dl className="relative mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {items.map(({ label, value }, i) => (
        <div key={label} className="glass-soft lift fade-up flex flex-col rounded-2xl px-4 py-3" style={{ "--d": i + 1 } as CSSProperties}>
          <dt className="order-last text-[10px] font-bold uppercase tracking-widest text-muted">{label}</dt>
          <dd className="text-xl font-extrabold tabular-nums sm:text-2xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
