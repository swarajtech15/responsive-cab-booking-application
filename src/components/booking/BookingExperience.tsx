"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import CityMap, { type MapPadding } from "@/components/map/CityMap";
import BottomSheet, { type SnapId } from "./BottomSheet";
import { ChoosePanel, DonePanel, RidePanel, SearchingPanel, SelectPanel } from "./panels";
import type { ActiveRide, Status } from "./types";
import { createBooking, rateBooking, updateBookingStatus, useBookings, type BookingStatus } from "@/lib/booking-storage";
import {
  CATEGORIES,
  DRIVERS,
  GRID,
  WORLD_W,
  calcFare,
  estimateTrip,
  getCategory,
  pathLength,
  placeName,
  pointAt,
  remainingPath,
  routeBetween,
  samePt,
  snapPt,
  type CategoryId,
  type FareBreakdown,
  type Landmark,
  type PaymentId,
  type Pt,
} from "@/lib/city";

const HOME_PICKUP: Pt = { x: 850, y: 550 };
type BookingStep = Exclude<Status, "ontrip" | "completed">;

const subscribeResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const useWinW = () => useSyncExternalStore(subscribeResize, () => window.innerWidth, () => 1280);
const useWinH = () => useSyncExternalStore(subscribeResize, () => window.innerHeight, () => 800);

const DEFAULT_SNAP: Record<Status, SnapId> = {
  select: "half",
  choose: "full",
  searching: "half",
  arriving: "half",
  arrived: "half",
  ontrip: "half",
  completed: "full",
};

function driverStart(p: Pt): Pt {
  const sx = Math.random() < 0.5 ? -1 : 1;
  const sy = Math.random() < 0.5 ? -1 : 1;
  const dx = (3 + Math.floor(Math.random() * 3)) * GRID;
  const dy = (2 + Math.floor(Math.random() * 3)) * GRID;
  let x = p.x + sx * dx;
  let y = p.y + sy * dy;
  if (x < GRID || x > WORLD_W - GRID) x = p.x - sx * dx;
  if (y < GRID || y > 1350) y = p.y - sy * dy;
  const s = snapPt({ x, y });
  return samePt(s, p) ? snapPt({ x: p.x + 200, y: p.y + 100 }) : s;
}

export default function BookingExperience() {
  const [pickup, setPickup] = useState<Pt | null>(HOME_PICKUP);
  const [drop, setDrop] = useState<Pt | null>(null);
  const [target, setTarget] = useState<"pickup" | "drop">("drop");
  const [step, setStep] = useState<BookingStep>("select");
  const [category, setCategory] = useState<CategoryId>("economy");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [progress, setProgress] = useState(0);
  const [sheetPosition, setSheetPosition] = useState<{ status: Status; snap: SnapId } | null>(null);
  const [nonce, setNonce] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bookingLocked = useRef(false);

  const bookings = useBookings();
  const booking = activeRide && bookings.find((item) => item.id === activeRide.id);
  const ride = booking && booking.status !== "cancelled" ? activeRide : null;
  let status: Status = step;
  if (activeRide && !ride) status = "select";
  if (booking?.status === "ongoing") status = "ontrip";
  if (booking?.status === "completed") status = "completed";
  const snap = sheetPosition?.status === status ? sheetPosition.snap : DEFAULT_SNAP[status];

  const w = useWinW();
  const h = useWinH();
  const desktop = w >= 1024;
  const tabOffset = w < 768 ? 84 : 16;

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const refit = useCallback(() => setNonce((n) => n + 1), []);
  const go = useCallback((next: BookingStep) => {
    setStep(next);
    setSheetPosition(null);
  }, []);

  /* ------------------------------ derived ------------------------------ */
  const pickupName = pickup ? placeName(pickup) : "";
  const dropName = drop ? placeName(drop) : "";

  const route = useMemo(
    () => (pickup && drop && !samePt(pickup, drop) ? routeBetween(pickup, drop) : null),
    [pickup, drop],
  );
  const trip = useMemo(() => (route ? estimateTrip(route) : null), [route]);
  const quotes = useMemo(() => {
    if (!trip) return null;
    return Object.fromEntries(
      CATEGORIES.map((c) => [c.id, calcFare(c.id, trip.km, trip.min)]),
    ) as Record<CategoryId, FareBreakdown>;
  }, [trip]);

  /* ------------------------------ actions ------------------------------ */
  const place = useCallback(
    (p: Pt, fromList: boolean) => {
      if (target === "pickup") {
        if (samePt(p, drop)) return notify("Pickup and drop-off can't be the same spot");
        setPickup(p);
        setTarget("drop");
      } else {
        if (samePt(p, pickup)) return notify("Pickup and drop-off can't be the same spot");
        setDrop(p);
      }
      if (fromList) refit();
    },
    [target, drop, pickup, notify, refit],
  );

  const swap = () => {
    setPickup(drop);
    setDrop(pickup);
    refit();
  };

  const locate = () => {
    if (status === "select") {
      if (samePt(drop, HOME_PICKUP)) return notify("Drop-off is already at your location");
      setPickup(HOME_PICKUP);
      setTarget("drop");
      notify("Pickup set to your current location");
    }
    refit();
  };

  const book = () => {
    if (bookingLocked.current || status !== "choose" || !pickup || !drop || !route || !trip || !quotes) return;
    const pool = DRIVERS.filter((d) => d.category === category);
    const driver = pool[Math.floor(Math.random() * pool.length)];
    const approach = routeBetween(driverStart(pickup), pickup);
    bookingLocked.current = true;
    let rideId: string;
    try {
      const booking = createBooking({
        pickupName,
        dropName,
        pickupX: pickup.x,
        pickupY: pickup.y,
        dropX: drop.x,
        dropY: drop.y,
        category,
        distanceKm: trip.km,
        durationMin: trip.min,
        fare: quotes[category].total,
        paymentMethod: payment,
        driverName: driver.name,
        vehicle: `${driver.vehicle} · ${driver.color}`,
        plate: driver.plate,
      });
      rideId = booking.id;
    } catch {
      bookingLocked.current = false;
      notify("Couldn't save this booking. Check your browser storage and try again.");
      return;
    }
    setActiveRide({
      id: rideId,
      category,
      driver,
      approach,
      route,
      fare: quotes[category],
      km: trip.km,
      min: trip.min,
      approachMin: Math.max(2, estimateTrip(approach).min),
      payment,
      otp: String(1000 + Math.floor(Math.random() * 9000)),
      pickup,
      drop,
      pickupName,
      dropName,
    });
    setProgress(0);
    go("searching");
  };

  const changeStatus = useCallback(
    (id: string, next: BookingStatus) => {
      try {
        updateBookingStatus(id, next);
        return true;
      } catch {
        notify("Couldn't update this ride. Try again in Ride History.");
        return false;
      }
    },
    [notify],
  );

  const cancelRide = () => {
    if (!ride || !changeStatus(ride.id, "cancelled")) return;
    setActiveRide(null);
    notify("Ride cancelled. No charges applied.");
    go("select");
  };

  const reset = () => {
    setDrop(null);
    setTarget("drop");
    setActiveRide(null);
    go("select");
  };

  const rate = (n: number) => {
    if (!ride) return;
    try {
      rateBooking(ride.id, n);
    } catch {
      notify("Couldn't save your rating. Please try again.");
    }
  };

  /* ------------------------- live ride simulation ------------------------- */
  // searching → driver found
  useEffect(() => {
    if (status !== "searching") return;
    const t = setTimeout(() => {
      setProgress(0);
      go("arriving");
      notify("Driver found! They're on the way.");
    }, 3000);
    return () => clearTimeout(t);
  }, [status, go, notify]);

  // arriving / ontrip movement
  useEffect(() => {
    if (!ride || (status !== "arriving" && status !== "ontrip")) return;
    const path = status === "arriving" ? ride.approach : ride.route;
    const len = pathLength(path);
    const dur = status === "arriving" ? Math.min(12000, Math.max(6000, len * 30)) : Math.min(40000, Math.max(14000, len * 22));
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      if (now - last > 32 || p === 1) {
        last = now;
        setProgress(p);
      }
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (status === "arriving") {
        go("arrived");
        notify("Your driver has arrived");
      } else {
        changeStatus(ride.id, "completed");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, ride, go, notify, changeStatus]);

  // arrived → trip starts
  useEffect(() => {
    if (status !== "arrived" || !ride) return;
    const t = setTimeout(() => {
      if (!changeStatus(ride.id, "ongoing")) return;
      setProgress(0);
      notify("Trip started. Enjoy your ride!");
    }, 3800);
    return () => clearTimeout(t);
  }, [status, ride, changeStatus, notify]);

  /* ------------------------------ map props ------------------------------ */
  const vehicle = useMemo(() => {
    if (!ride) return null;
    if (status === "arriving") return pointAt(ride.approach, progress);
    if (status === "arrived") return pointAt(ride.approach, 1);
    if (status === "ontrip") return pointAt(ride.route, progress);
    if (status === "completed") return pointAt(ride.route, 1);
    return null;
  }, [ride, status, progress]);

  const drawRoute = useMemo(() => {
    if (status === "completed") return null;
    if (ride && status === "ontrip") return remainingPath(ride.route, progress);
    if (ride && (status === "arriving" || status === "arrived")) return ride.route;
    return route;
  }, [status, ride, progress, route]);

  const drawApproach = useMemo(() => {
    if (ride && status === "arriving") return remainingPath(ride.approach, progress);
    return null;
  }, [ride, status, progress]);

  const focus = useMemo(() => {
    const pts: Pt[] = [];
    if (ride && (status === "arriving" || status === "arrived")) pts.push(ride.approach[0], ride.pickup, ride.drop);
    else {
      if (pickup) pts.push(pickup);
      if (drop) pts.push(drop);
    }
    return pts;
  }, [ride, status, pickup, drop]);

  const heights = useMemo(() => {
    const full = Math.min(Math.round(h * 0.84), h - tabOffset - 100);
    return { peek: 150, half: Math.min(Math.round(h * 0.5), full), full };
  }, [h, tabOffset]);

  const padding: MapPadding = desktop
    ? { top: 96, right: 90, bottom: 60, left: 450 }
    : { top: 96, right: 64, bottom: heights[snap] + tabOffset + 24, left: 28 };

  /* ------------------------------ panel ------------------------------ */
  let panel: React.ReactNode;
  let label = "Choose pickup and drop-off";
  if (status === "select") {
    panel = (
      <SelectPanel
        pickup={pickup}
        drop={drop}
        pickupName={pickupName}
        dropName={dropName}
        target={target}
        setTarget={setTarget}
        onPickLandmark={(lm: Landmark) => place({ x: lm.x, y: lm.y }, true)}
        onSwap={swap}
        onContinue={() => {
          bookingLocked.current = false;
          setActiveRide(null);
          go("choose");
        }}
      />
    );
  } else if (status === "choose" && trip && quotes) {
    label = "Choose a ride";
    panel = (
      <ChoosePanel
        pickupName={pickupName}
        dropName={dropName}
        km={trip.km}
        min={trip.min}
        quotes={quotes}
        category={category}
        setCategory={setCategory}
        payment={payment}
        setPayment={setPayment}
        onBack={() => go("select")}
        onBook={book}
      />
    );
  } else if (ride && status === "searching") {
    label = "Finding a driver";
    panel = <SearchingPanel rideId={ride.id} onCancel={cancelRide} categoryName={getCategory(category).name} />;
  } else if (ride && status === "completed") {
    label = "Trip complete";
    panel = <DonePanel ride={ride} rating={booking?.rating ?? 0} onRate={rate} onNew={reset} />;
  } else if (ride) {
    label = "Live ride status";
    panel = <RidePanel status={status} ride={ride} progress={progress} onCancel={cancelRide} notify={notify} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <CityMap
        pickup={status === "ontrip" || status === "completed" ? null : pickup}
        drop={drop}
        route={drawRoute}
        approach={drawApproach}
        vehicle={vehicle}
        pickEnabled={status === "select"}
        pickLabel={`Tap the map to set ${target === "pickup" ? "pickup" : "drop-off"}`}
        searching={status === "searching"}
        focus={focus}
        fitKey={`${status}-${nonce}`}
        padding={padding}
        onPick={(p) => place(p, false)}
        onLocate={locate}
      />

      <BottomSheet snap={snap} onSnap={(next) => setSheetPosition({ status, snap: next })} heights={heights} label={label}>
        {panel}
      </BottomSheet>

      {toast && (
        <div
          role="status"
          className="toast-in glass-strong fixed left-1/2 top-[76px] z-50 max-w-[90vw] -translate-x-1/2 rounded-2xl px-4 py-2.5 text-sm font-bold md:top-[84px]"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
