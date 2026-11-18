"use client";

import { useEffect, useState, type CSSProperties } from "react";

type LettersProps = { text: string; className?: string; intro?: boolean };

/** Splits text into words (wrap-safe) and letters (animatable). */
function letters(text: string, letterClass: string) {
  let i = 0;
  return text.split(" ").map((word, w, arr) => (
    <span key={w}>
      <span className="fx-word" aria-hidden="true">
        {Array.from(word).map((ch) => {
          const idx = i++;
          return (
            <span key={idx} className={letterClass} style={{ "--i": idx } as CSSProperties}>
              {ch}
            </span>
          );
        })}
      </span>
      {w < arr.length - 1 ? " " : ""}
    </span>
  ));
}

/** Letters flip in 3D when hovered (and optionally flip in on mount). */
export function FlipText({ text, className = "", intro = false }: LettersProps) {
  return (
    <span className={`flip-text ${intro ? "flip-intro" : ""} ${className}`} aria-label={text}>
      {letters(text, "flip-letter")}
    </span>
  );
}

/** Each letter springs up individually as the pointer passes over it. */
export function HoverText({ text, className = "" }: LettersProps) {
  return (
    <span className={className} aria-label={text}>
      {letters(text, "hover-letter")}
    </span>
  );
}

/** Text rolls upward to reveal an accent coloured copy. Use inside a `.group`. */
export function RollText({ text, className = "" }: LettersProps) {
  return (
    <span className={`roll ${className}`}>
      <span className="roll-inner" data-text={text}>
        {text}
      </span>
    </span>
  );
}

/** Cycles through words with a 3D flip animation. */
export function FlipWords({
  words,
  interval = 2200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className="inline-block" style={{ perspective: 600 }} aria-live="off">
      <span key={i} className={`flip-word ${className}`}>
        {words[i]}
      </span>
    </span>
  );
}
