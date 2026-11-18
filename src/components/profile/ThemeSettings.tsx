"use client";

import { BG_OPTIONS, setBg, setMode, useBg, useMode, type Mode } from "@/lib/theme-store";
import { CheckIcon, MoonIcon, SunIcon } from "@/components/ui/Icons";
import { HoverText } from "@/components/ui/TextFx";

export default function ThemeSettings() {
  const mode = useMode();
  const bg = useBg();

  const modes: { id: Mode; label: string; Icon: typeof SunIcon; hint: string }[] = [
    { id: "light", label: "Light", Icon: SunIcon, hint: "Bright & airy" },
    { id: "dark", label: "Dark", Icon: MoonIcon, hint: "Easy on the eyes" },
  ];

  return (
    <section className="glass rounded-3xl p-5 sm:p-6" aria-labelledby="appearance-title">
      <h2 id="appearance-title" className="text-xl font-extrabold tracking-tight">
        <HoverText text="Appearance" />
      </h2>
      <p className="text-sm text-muted">Pick a theme and a background colour. Changes apply instantly across the app.</p>

      <p className="mb-2 mt-5 text-[10px] font-extrabold uppercase tracking-widest text-muted">Theme mode</p>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Theme mode">
        {modes.map(({ id, label, Icon, hint }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(id)}
              className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                active ? "border-accent bg-accent/10 shadow-[0_8px_26px_color-mix(in_srgb,var(--accent)_25%,transparent)]" : "border-line bg-chip hover:border-accent/50"
              }`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-xl text-2xl transition-transform duration-500 group-hover:rotate-[360deg] ${active ? "bg-accent text-onaccent" : "bg-bg/70"}`}>
                <Icon />
              </span>
              <span>
                <span className="block font-extrabold">{label}</span>
                <span className="block text-xs text-muted">{hint}</span>
              </span>
              {active && <CheckIcon className="absolute right-3 top-3 text-accent" />}
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-6 text-[10px] font-extrabold uppercase tracking-widest text-muted">Background colour</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Background colour">
        {BG_OPTIONS.map((o) => {
          const active = bg === o.id;
          const fill = mode === "dark" ? o.dark : o.light;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={o.label}
              onClick={() => setBg(o.id)}
              className={`group flex flex-col items-center gap-2 rounded-2xl border p-2.5 transition-all hover:-translate-y-1 ${
                active ? "border-accent bg-accent/10" : "border-line bg-chip hover:border-accent/50"
              }`}
            >
              <span
                className="relative grid h-12 w-12 place-items-center rounded-full border-2 border-white/70 shadow-md transition-transform group-hover:scale-110"
                style={{ background: fill, boxShadow: `0 4px 14px ${o.accent}55` }}
              >
                <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-white/80" style={{ background: o.accent }} />
                {active && <CheckIcon className="text-lg" style={{ color: mode === "dark" ? "#fff" : o.accent }} />}
              </span>
              <span className="text-center text-[11px] font-bold leading-tight">{o.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
