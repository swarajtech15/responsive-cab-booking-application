import type { CSSProperties } from "react";
import ProfileStats from "@/components/profile/ProfileStats";
import ThemeSettings from "@/components/profile/ThemeSettings";
import { FlipText, HoverText } from "@/components/ui/TextFx";
import { BellIcon, GlobeIcon, LifebuoyIcon, ShieldIcon, StarIcon, WalletIcon } from "@/components/ui/Icons";
import { formatINR } from "@/lib/city";

export const metadata = { title: "Profile — SwiftCab" };

const SAVED = [
  { icon: "🏠", label: "Home", place: "Lake Gardens, Green Belt" },
  { icon: "💼", label: "Work", place: "Tech Park, Innovation Hub" },
  { icon: "🏋️", label: "Gym", place: "Skyline Stadium, Sports Ave" },
];

const PAYMENTS = [
  { name: "UPI", detail: "masterash@okbank", badge: "Default" },
  { name: "Visa Card", detail: "•••• 4242", badge: "" },
  { name: "SwiftWallet", detail: formatINR(1250) + " balance", badge: "" },
];

const SETTINGS = [
  { Icon: BellIcon, label: "Notifications", sub: "Ride alerts & offers" },
  { Icon: GlobeIcon, label: "Language", sub: "English (India)" },
  { Icon: ShieldIcon, label: "Safety centre", sub: "Trusted contacts, SOS" },
  { Icon: LifebuoyIcon, label: "Help & support", sub: "24×7 assistance" },
];

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-24 md:px-6 md:pb-16 md:pt-28">
      {/* hero */}
      <section className="glass fade-up relative overflow-hidden rounded-[32px] p-5 sm:p-8" aria-label="Profile summary">
        <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-accent2/25 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="group relative">
            <span className="absolute -inset-1.5 rounded-[30px] bg-gradient-to-br from-accent to-accent2 opacity-70 blur-md transition-opacity group-hover:opacity-100" />
            <span className="relative grid h-24 w-24 place-items-center rounded-[26px] bg-gradient-to-br from-accent to-accent2 text-4xl font-extrabold text-onaccent shadow-xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105 sm:h-28 sm:w-28">
              MA
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-accent">Gold member</p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <FlipText text="MasterAsh" intro />
            </h1>
            <p className="mt-1 text-sm font-medium text-muted">masterash@swiftcab.app · +91 98765 43210</p>
            <p className="text-sm text-muted">
              <HoverText text="Riding with SwiftCab since 2024" />
            </p>
          </div>
        </div>

        <ProfileStats />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="fade-up lg:col-span-3" style={{ "--d": 2 } as CSSProperties}>
          <ThemeSettings />
        </div>

        <div className="space-y-5 lg:col-span-2">
          <section className="glass fade-up rounded-3xl p-5" style={{ "--d": 3 } as CSSProperties} aria-labelledby="saved-title">
            <h2 id="saved-title" className="mb-3 text-lg font-extrabold">
              <HoverText text="Saved places" />
            </h2>
            <ul className="space-y-1.5">
              {SAVED.map((s) => (
                <li key={s.label} className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-all hover:translate-x-1 hover:bg-accent/10">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-chip text-lg transition-transform group-hover:scale-110 group-hover:rotate-6">{s.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold">{s.label}</span>
                    <span className="block truncate text-xs text-muted">{s.place}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass fade-up rounded-3xl p-5" style={{ "--d": 4 } as CSSProperties} aria-labelledby="pay-title">
            <h2 id="pay-title" className="mb-3 flex items-center gap-2 text-lg font-extrabold">
              <WalletIcon className="text-accent" />
              <HoverText text="Payment methods" />
            </h2>
            <ul className="space-y-1.5">
              {PAYMENTS.map((p) => (
                <li key={p.name} className="flex items-center justify-between rounded-2xl bg-chip px-3.5 py-2.5">
                  <span>
                    <span className="block text-sm font-extrabold">{p.name}</span>
                    <span className="block text-xs text-muted">{p.detail}</span>
                  </span>
                  {p.badge && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-accent">{p.badge}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="glass fade-up mt-5 rounded-3xl p-3 sm:p-4" style={{ "--d": 5 } as CSSProperties} aria-label="Settings">
        <ul className="grid gap-1 sm:grid-cols-2">
          {SETTINGS.map(({ Icon, label, sub }) => (
            <li key={label} className="group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all hover:bg-accent/10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-lg text-accent transition-transform group-hover:scale-110 group-hover:-rotate-6">
                <Icon />
              </span>
              <span>
                <span className="block text-sm font-extrabold">{label}</span>
                <span className="block text-xs text-muted">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex items-center justify-center gap-1.5 pb-1 text-xs font-semibold text-muted">
          <StarIcon filled className="text-amber-400" /> SwiftCab v1.0 · Made for MasterAsh
        </p>
      </section>
    </div>
  );
}
