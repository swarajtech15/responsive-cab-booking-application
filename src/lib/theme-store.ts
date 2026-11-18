"use client";

import { useSyncExternalStore } from "react";

export type Mode = "light" | "dark";

export const BG_OPTIONS = [
  { id: "white", label: "Pure White", light: "#ffffff", dark: "#090d18", accent: "#4f46e5" },
  { id: "sky", label: "Sky Blue", light: "#eef6ff", dark: "#07142a", accent: "#2563eb" },
  { id: "mint", label: "Fresh Mint", light: "#ecfdf5", dark: "#061c17", accent: "#059669" },
  { id: "blush", label: "Rose Blush", light: "#fff1f3", dark: "#1d0a13", accent: "#e11d48" },
  { id: "lavender", label: "Lavender", light: "#f5f2ff", dark: "#120d27", accent: "#7c3aed" },
  { id: "sand", label: "Warm Sand", light: "#fffaeb", dark: "#1c1507", accent: "#d97706" },
] as const;

export type BgId = (typeof BG_OPTIONS)[number]["id"];

export const MODE_KEY = "swiftcab-mode";
export const BG_KEY = "swiftcab-bg";

const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getMode(): Mode {
  return read(MODE_KEY) === "dark" ? "dark" : "light";
}

export function getBg(): BgId {
  const v = read(BG_KEY);
  return (BG_OPTIONS.find((b) => b.id === v)?.id ?? "white") as BgId;
}

function apply(mode: Mode, bg: BgId) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.bg = bg;
  root.style.colorScheme = mode;
}

function emit() {
  listeners.forEach((l) => l());
}

export function setMode(mode: Mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {}
  apply(mode, getBg());
  emit();
}

export function setBg(bg: BgId) {
  try {
    localStorage.setItem(BG_KEY, bg);
  } catch {}
  apply(getMode(), bg);
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useMode(): Mode {
  return useSyncExternalStore(subscribe, getMode, () => "light" as Mode);
}

export function useBg(): BgId {
  return useSyncExternalStore(subscribe, getBg, () => "white" as BgId);
}

/** Inline script run before hydration to avoid a theme flash. */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${MODE_KEY}')==='dark'?'dark':'light';var b=localStorage.getItem('${BG_KEY}')||'white';var r=document.documentElement;r.dataset.theme=m;r.dataset.bg=b;r.style.colorScheme=m;}catch(e){}})();`;
