"use client";

import { useSyncExternalStore } from "react";
import { CATEGORIES, PAYMENTS, type CategoryId, type PaymentId } from "./city";

export type BookingStatus = "confirmed" | "ongoing" | "completed" | "cancelled";

export interface Booking {
  id: string;
  createdAt: string;
  pickupName: string;
  dropName: string;
  pickupX: number;
  pickupY: number;
  dropX: number;
  dropY: number;
  category: CategoryId;
  distanceKm: number;
  durationMin: number;
  fare: number;
  status: BookingStatus;
  paymentMethod: PaymentId;
  driverName: string;
  vehicle: string;
  plate: string;
  rating: number | null;
}

export type NewBooking = Omit<Booking, "id" | "createdAt" | "status" | "rating">;

const KEY_PREFIX = "swiftcab:booking:v1:";
const EMPTY: Booking[] = [];
const serverSnapshot = () => EMPTY;
const transitions: Record<BookingStatus, BookingStatus[]> = {
  confirmed: ["ongoing", "cancelled"],
  ongoing: ["completed"],
  completed: [],
  cancelled: [],
};

function isRating(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

function isBooking(value: unknown, id: string): value is Booking {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    r.id === id && id.startsWith("RIDE-") &&
    typeof r.createdAt === "string" && Number.isFinite(Date.parse(r.createdAt)) &&
    typeof r.status === "string" && Object.hasOwn(transitions, r.status) &&
    [r.pickupName, r.dropName, r.driverName, r.vehicle, r.plate].every(
      (s) => typeof s === "string" && s.trim().length > 0,
    ) &&
    [r.pickupX, r.pickupY, r.dropX, r.dropY, r.distanceKm, r.durationMin, r.fare].every(
      (n) => typeof n === "number" && Number.isFinite(n) && n >= 0,
    ) &&
    CATEGORIES.some((category) => category.id === r.category) &&
    PAYMENTS.some((payment) => payment.id === r.paymentMethod) &&
    (r.rating === null || isRating(r.rating))
  );
}

function decode(raw: string | null, id: string): Booking | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isBooking(value, id) ? value : null;
  } catch {
    return null;
  }
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return EMPTY;
  const bookings: Booking[] = [];
  try {
    const storage = window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) continue;
      const booking = decode(storage.getItem(key), key.slice(KEY_PREFIX.length));
      if (booking) bookings.push(booking);
    }
  } catch {
    return EMPTY;
  }
  return bookings.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function findBooking(id: string): Booking | null {
  if (typeof window === "undefined") return null;
  try {
    return decode(window.localStorage.getItem(KEY_PREFIX + id), id);
  } catch {
    return null;
  }
}

// Keep the snapshot stable across renders, including live map animation frames.
let snapshot: Booking[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Booking[] {
  return (snapshot ??= getBookings());
}

function notify() {
  snapshot = null;
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key === null || event.key.startsWith(KEY_PREFIX)) notify();
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    snapshot = null;
  }
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      snapshot = null;
    }
  };
}

export function useBookings(): Booking[] {
  return useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
}

function browserStorage(): Storage {
  if (typeof window === "undefined") throw new Error("Bookings require browser storage.");
  return window.localStorage;
}

function saveBooking(storage: Storage, booking: Booking): Booking {
  storage.setItem(KEY_PREFIX + booking.id, JSON.stringify(booking));
  notify();
  return booking;
}

export function createBooking(input: NewBooking): Booking {
  const storage = browserStorage();
  let id: string;
  do {
    const bytes = window.crypto.getRandomValues(new Uint8Array(8));
    id = "RIDE-" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  } while (storage.getItem(KEY_PREFIX + id) !== null);
  const booking: Booking = { ...input, id, createdAt: new Date().toISOString(), status: "confirmed", rating: null };
  if (!isBooking(booking, id)) throw new Error("The ride details are incomplete.");
  return saveBooking(storage, booking);
}

function requireBooking(storage: Storage, id: string): Booking {
  const booking = decode(storage.getItem(KEY_PREFIX + id), id);
  if (!booking) throw new Error("This ride could not be found.");
  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus): Booking {
  const storage = browserStorage();
  const booking = requireBooking(storage, id);
  if (booking.status === status) return booking;
  if (!transitions[booking.status].includes(status)) {
    throw new Error(`This ride is already ${booking.status}.`);
  }
  return saveBooking(storage, { ...booking, status });
}

export function rateBooking(id: string, rating: number): Booking {
  const storage = browserStorage();
  const booking = requireBooking(storage, id);
  if (booking.status !== "completed") throw new Error("Only completed rides can be rated.");
  if (!isRating(rating)) throw new Error("Choose a rating between 1 and 5 stars.");
  return saveBooking(storage, { ...booking, rating });
}

export function summarize(bookings: Booking[]) {
  const completed = bookings.filter((booking) => booking.status === "completed");
  const ratings = completed.flatMap(({ rating }) => rating === null ? [] : [rating]);
  return {
    total: bookings.length,
    completed: completed.length,
    spent: completed.reduce((sum, booking) => sum + booking.fare, 0),
    distance: Math.round(completed.reduce((sum, booking) => sum + booking.distanceKm, 0) * 10) / 10,
    avgRating: ratings.length
      ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length * 10) / 10
      : 0,
  };
}
