import { useRef } from "react";
import { CHAPTERS, START, TOTAL, clamp, clock, scrollToU, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";
import { scramble } from "../lib/scramble";

const two = (value: number) => String(Math.floor(value)).padStart(2, "0");

/**
 * Vremenska linija: timecode snimka, naziv poglavlja i šina sa strane.
 * Na samom kraju vrijeme staje: sajt je "van vremena".
 */
export function Hud({ entered }: { entered: boolean }) {
  const { t } = useLanguage();
  const code = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const translate = useRef(t);
  translate.current = t;

  useFrame(({ u, p }) => {
    const beyond = p > 0.992;
    const time = clock.time;
    const text = beyond
      ? "∞"
      : `00:${two(time / 60)}:${two(time % 60)}:${two((time % 1) * clock.fps)}`;
    if (code.current && code.current.textContent !== text) code.current.textContent = text;

    let chapter: (typeof CHAPTERS)[number] = CHAPTERS[0];
    for (const item of CHAPTERS) if (u >= START[item.id] - 0.02) chapter = item;
    const name = translate.current(beyond ? "chBeyond" : chapter.label);
    if (label.current && label.current.dataset.text !== name) {
      label.current.dataset.text = name;
      scramble(label.current, name);
    }

    const k = clamp(p);
    if (marker.current) marker.current.style.top = `${(k * 100).toFixed(2)}%`;
    if (fill.current) fill.current.style.transform = `scaleY(${k.toFixed(4)})`;
  });

  return (
    <div className={entered ? "hud is-entered" : "hud"}>
      <p className="hud-time" aria-hidden="true">
        <span ref={code}>00:00:00:00</span>
        <span className="hud-label" ref={label} />
      </p>
      <nav className="hud-rail" aria-label={t("timeline")}>
        <span className="hud-fill" ref={fill} aria-hidden="true" />
        <span className="hud-marker" ref={marker} aria-hidden="true" />
        {CHAPTERS.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            style={{ top: `${(START[chapter.id] / TOTAL) * 100}%` }}
            onClick={() => scrollToU(START[chapter.id] + (chapter.id === "hero" ? 0 : chapter.len * 0.35))}
          >
            <span>{t(chapter.label)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
