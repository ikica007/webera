/**
 * Natpis se "dekodira": slova prolaze kroz nasumične znakove
 * i slažu se s lijeva na desno u pravi tekst.
 */
const GLYPHS = "/\\|_-+=<>01#*";
const running = new WeakMap<HTMLElement, number>();

export function scramble(el: HTMLElement | null, text: string, duration = 520) {
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = text;
    return;
  }
  cancelAnimationFrame(running.get(el) || 0);
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / duration);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const settle = i / Math.max(1, text.length);
      if (text[i] === " " || k > settle * 0.75 + 0.25) out += text[i];
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (k < 1) running.set(el, requestAnimationFrame(step));
  };
  running.set(el, requestAnimationFrame(step));
}

/** Na prelazak mišem preko elementa sa [data-scramble] natpis se dekodira. */
export function bindHoverScramble() {
  const onOver = (event: PointerEvent) => {
    const el = (event.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-scramble]");
    if (!el || el.contains(event.relatedTarget as Node)) return;
    scramble(el, el.dataset.scramble || el.textContent || "", 420);
  };
  document.addEventListener("pointerover", onOver, { passive: true });
  return () => document.removeEventListener("pointerover", onOver);
}
