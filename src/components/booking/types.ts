import type { CategoryId, Driver, FareBreakdown, PaymentId, Pt } from "@/lib/city";

export type Status =
  | "select"
  | "choose"
  | "searching"
  | "arriving"
  | "arrived"
  | "ontrip"
  | "completed";

export type ActiveRide = {
  id: string;
  category: CategoryId;
  driver: Driver;
  approach: Pt[];
  route: Pt[];
  fare: FareBreakdown;
  km: number;
  min: number;
  approachMin: number;
  payment: PaymentId;
  otp: string;
  pickup: Pt;
  drop: Pt;
  pickupName: string;
  dropName: string;
};
