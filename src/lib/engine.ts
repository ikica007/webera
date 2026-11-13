import { useEffect, useRef } from "react";

/**
 * Jedan zajednički "sat" za cijeli sajt.
 * Čita skrol, ublažava ga i šalje isti kadar svim slojevima (video, 3D paneli,
 * tekst, timecode), da se sve kreće usklađeno.
 *
 * Sajt je jedan neprekidan kadar: skrol ne pomjera stranicu, nego kameru.
 * Poglavlja ispod određuju koliko skrola (u visinama ekrana) traje svaki dio.
 */

export type Frame = {
  /** ublažena pozicija u visinama ekrana, 0 → TOTAL */
  u: number;
  /** ublažen napredak kroz cijeli sajt, 0–1 */
  p: number;
  /** brzina (visina ekrana u sekundi), ublažena */
  v: number;
  /** vrijeme u sekundama od starta */
  t: number;
  dt: number;
};

type Subscriber = (frame: Frame) => void;

const hasWindow = typeof window !== "undefined";

export const reducedMotion =
  hasWindow && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer =
  hasWindow && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** 0 → 1 dok x ide od a do b, sa mekim krajevima */
export const ramp = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
/** -1 (daleko) → 0 (u fokusu, između a+e i b-e) → 1 (prošao pored kamere) */
export const phase = (a: number, b: number, e: number, x: number) =>
  ramp(a, a + e, x) - 1 + ramp(b - e, b, x);

/** Poglavlja: redoslijed i trajanje (u visinama ekrana). Mijenjaj samo `len`. */
export const CHAPTERS = [
  { id: "hero", label: "chStart", len: 1.3 },
  { id: "about", label: "chIdea", len: 2.6 },
  { id: "work", label: "chWork", len: 6.6 },
  { id: "principles", label: "chPrinciples", len: 1.8 },
  { id: "numbers", label: "chNumbers", len: 1.3 },
  { id: "contact", label: "chContact", len: 1.2 },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

export const TOTAL = CHAPTERS.reduce((sum, chapter) => sum + chapter.len, 0);
export const START = {} as Record<ChapterId, number>;
export const LEN = {} as Record<ChapterId, number>;
{
  let at = 0;
  for (const chapter of CHAPTERS) {
    START[chapter.id] = at;
    LEN[chapter.id] = chapter.len;
    at += chapter.len;
  }
}

/** Napredak unutar poglavlja: 0 na početku, 1 na kraju (nije ograničen). */
export const local = (id: ChapterId, u: number) => (u - START[id]) / LEN[id];

/** Stanje učitavanja kadrova, čita ga ekran za učitavanje. */
export const loadState = { progress: 0, ready: false };

/** Podaci o snimku, čita ih timecode. */
export const clock = { duration: 15, fps: 24, time: 0 };

/** Miš: x, y su ublaženi (-1 … 1), px/py sirovi pikseli. */
export const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: -200, py: -200, active: false };

const subscribers = new Set<Subscriber>();
let rafId = 0;
let running = false;
let lastTime = 0;
let startTime = 0;
let smoothY = 0;
let smoothV = 0;
let unit = 1;
let maxScroll = 1;

function measure() {
  maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  unit = maxScroll / TOTAL;
}

function tick(now: number) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const targetY = clamp(window.scrollY, 0, maxScroll);
  const previous = smoothY;
  smoothY += (targetY - smoothY) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 5.5));
  if (Math.abs(targetY - smoothY) < 0.05) smoothY = targetY;

  const rawV = dt > 0 ? (smoothY - previous) / unit / dt : 0;
  smoothV += (rawV - smoothV) * (1 - Math.exp(-dt * 9));
  if (Math.abs(smoothV) < 0.0005) smoothV = 0;

  const follow = 1 - Math.exp(-dt * 4.5);
  pointer.x += (pointer.tx - pointer.x) * follow;
  pointer.y += (pointer.ty - pointer.y) * follow;

  const frame: Frame = {
    u: smoothY / unit,
    p: smoothY / maxScroll,
    v: reducedMotion ? 0 : smoothV,
    t: (now - startTime) / 1000,
    dt,
  };
  subscribers.forEach((fn) => fn(frame));
  rafId = requestAnimationFrame(tick);
}

function onPointer(event: PointerEvent) {
  if (event.pointerType !== "mouse") return;
  pointer.active = true;
  pointer.px = event.clientX;
  pointer.py = event.clientY;
  pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
}

function start() {
  if (running) return;
  running = true;
  startTime = lastTime = performance.now();
  measure();
  smoothY = window.scrollY;
  window.addEventListener("resize", measure);
  window.addEventListener("pointermove", onPointer, { passive: true });
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
  rafId = requestAnimationFrame(tick);
}

export function subscribe(fn: Subscriber) {
  subscribers.add(fn);
  start();
  return () => {
    subscribers.delete(fn);
  };
}

/** Poziva `fn` na svaki kadar dok je komponenta na ekranu. */
export function useFrame(fn: Subscriber) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => subscribe((frame) => ref.current(frame)), []);
}

/** Skrol do tačke na vremenskoj liniji (u visinama ekrana). */
export function scrollToU(u: number) {
  measure();
  window.scrollTo({ top: u * unit, behavior: reducedMotion ? "auto" : "smooth" });
}

/** Premotava cijeli film unazad do početka. */
export function rewind() {
  if (reducedMotion) {
    window.scrollTo(0, 0);
    return;
  }
  const from = window.scrollY;
  const duration = 2600;
  const began = performance.now();
  const step = (now: number) => {
    const k = clamp((now - began) / duration);
    const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    window.scrollTo(0, from * (1 - eased));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Sadržaj dolazi iz dubine, zastane u fokusu, pa proleti pored kamere.
 * k: -1 (daleko) → 0 (fokus) → 1 (prošao).
 */
export function fly(el: HTMLElement | null, k: number, strength = 1) {
  if (!el) return;
  const distance = Math.abs(k);
  const opacity = 1 - ramp(0.3, 1, distance);
  if (opacity < 0.004) {
    if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
    return;
  }
  el.style.visibility = "visible";
  el.style.opacity = opacity.toFixed(3);
  if (reducedMotion) return;
  const scale = k < 0 ? 1 + k * 0.4 * strength : 1 + (k * 0.35 + k * k * 1.5) * strength;
  el.style.transform = `translate3d(0, ${(-k * 3).toFixed(2)}vh, 0) scale(${scale.toFixed(4)})`;
  const blur = finePointer && distance > 0.18 ? (distance - 0.18) * 16 : 0;
  el.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : "none";
}
