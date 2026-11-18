"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { setMode, useMode } from "@/lib/theme-store";
import { FlipText, RollText } from "@/components/ui/TextFx";
import { ClockIcon, HomeIcon, LogoMark, MoonIcon, SunIcon, UserIcon } from "@/components/ui/Icons";

const NAV = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/history", label: "History", Icon: ClockIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = useMode();

  return (
    <>
      <header className="fixed inset-x-2 top-2 z-40 md:inset-x-5 md:top-4">
        <div className="glass mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl px-3 md:px-4">
          <Link href="/home" className="group flex items-center gap-2.5" aria-label="SwiftCab home">
            <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="text-lg font-extrabold tracking-tight">
              <FlipText text="SwiftCab" />
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "bg-accent/15 text-accent" : "text-muted hover:bg-chip hover:text-fg"
                  }`}
                >
                  <Icon className="text-base" />
                  <RollText text={label} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
              className="glass-soft grid h-10 w-10 place-items-center rounded-xl text-lg transition-all hover:scale-110 hover:text-accent active:scale-95"
            >
              <span key={mode} className="flip-word">
                {mode === "dark" ? <SunIcon /> : <MoonIcon />}
              </span>
            </button>
            <Link
              href="/profile"
              className="group glass-soft hidden items-center gap-2 rounded-xl py-1 pl-1 pr-3 sm:flex"
              aria-label="Open profile"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent2 text-xs font-extrabold text-onaccent">
                MA
              </span>
              <span className="text-sm font-semibold">
                <RollText text="MasterAsh" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav
        aria-label="Primary mobile"
        className="glass-strong fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex h-[64px] items-center justify-around rounded-3xl px-2 md:hidden"
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-[76px] flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 text-[11px] font-bold transition-all active:scale-90 ${
                active ? "bg-accent/15 text-accent" : "text-muted"
              }`}
            >
              <Icon className={`text-xl transition-transform ${active ? "-translate-y-0.5 scale-110" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
