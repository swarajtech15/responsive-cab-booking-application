"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

export type SnapId = "peek" | "half" | "full";

type Props = {
  snap: SnapId;
  onSnap: (s: SnapId) => void;
  heights: Record<SnapId, number>;
  children: ReactNode;
  label: string;
};

/**
 * Accessible draggable bottom sheet on phones/tablets.
 * On large screens it turns into a floating glass side panel.
 */
export default function BottomSheet({ snap, onSnap, heights, children, label }: Props) {
  const [dragH, setDragH] = useState<number | null>(null);
  const start = useRef<{ y: number; h: number } | null>(null);
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, h: heights[snap] };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dy = start.current.y - e.clientY;
    if (Math.abs(dy) > 5) moved.current = true;
    if (moved.current) {
      setDragH(Math.min(heights.full, Math.max(heights.peek, start.current.h + dy)));
    }
  };
  const onPointerUp = () => {
    if (start.current && moved.current && dragH !== null) {
      const next = (Object.keys(heights) as SnapId[]).reduce((best, id) =>
        Math.abs(heights[id] - dragH) < Math.abs(heights[best] - dragH) ? id : best,
      );
      onSnap(next);
    }
    start.current = null;
    setDragH(null);
  };
  const onClick = () => {
    if (moved.current) return;
    onSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek");
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onSnap(snap === "peek" ? "half" : "full");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onSnap(snap === "full" ? "half" : "peek");
    }
  };

  const h = dragH ?? heights[snap];

  return (
    <section
      aria-label={label}
      style={{ "--sheet-h": `${h}px` } as CSSProperties}
      className={`glass-strong fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-2 right-2 z-30 flex h-[var(--sheet-h)] flex-col overflow-hidden rounded-[28px] md:bottom-4 md:left-1/2 md:right-auto md:w-[600px] md:-translate-x-1/2 lg:bottom-6 lg:left-6 lg:top-[88px] lg:h-auto lg:w-[410px] lg:translate-x-0 ${
        dragH === null ? "transition-[height] duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1)]" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Booking panel handle. Currently ${snap}. Press to expand or collapse, or drag.`}
        aria-expanded={snap !== "peek"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className="group flex w-full shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing lg:hidden"
      >
        <span className="h-1.5 w-11 rounded-full bg-muted/40 transition-all group-hover:w-16 group-hover:bg-accent" />
      </button>
      <div className="scroll-thin flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1 lg:px-5 lg:pb-5 lg:pt-5">
        {children}
      </div>
    </section>
  );
}
