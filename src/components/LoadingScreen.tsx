import { useEffect, useRef, useState } from "react";
import { loadState } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";
import { scramble } from "../lib/scramble";

const TICKS = 60;

/**
 * Učitavanje: brojčanik sata bez kazaljki. Podioci se pale kako film stiže,
 * a timecode broji do nule. Na kraju se brojčanik okrene bočno i postane
 * svjetlosna linija iz koje počinje sajt.
 */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"load" | "turn" | "out">("load");
  const ticks = useRef<(SVGLineElement | null)[]>([]);
  const code = useRef<HTMLSpanElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const slogan = useRef<HTMLParagraphElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    scramble(slogan.current, t("slogan"), 1100);
    let raf = 0;
    const timers: number[] = [];
    let shown = 0;
    let lit = -1;
    const began = performance.now();
    let last = began;
    const tick = (now: number) => {
      // brzina brojanja ne zavisi od broja sličica u sekundi, pa slabiji telefon ne čeka duže
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const target = loadState.ready ? 1 : Math.min(0.92, 0.03 + loadState.progress * 0.9);
      shown += (target - shown) * (1 - Math.exp(-dt * (loadState.ready ? 7 : 5)));
      const on = Math.round(shown * TICKS);
      if (on !== lit) {
        for (let i = 0; i < TICKS; i++) ticks.current[i]?.classList.toggle("is-on", i < on);
        lit = on;
      }
      // timecode broji unazad od 29 sekundi filma do nule
      const left = (1 - shown) * 29.12;
      const frames = Math.floor((left % 1) * 24);
      if (code.current) {
        code.current.textContent = `00:00:${String(Math.floor(left)).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
      }
      if (percent.current) percent.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (loadState.ready && shown > 0.97 && now - began > 1400) {
        setPhase("turn");
        timers.push(window.setTimeout(() => setPhase("out"), 900));
        timers.push(window.setTimeout(() => done.current(), 1700));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div className={`loader is-${phase}`} role="status" aria-live="polite">
      <span className="loader-brand" aria-hidden="true">WebEra</span>
      <span className="loader-index" aria-hidden="true">
        N° 001 — {t("chStart")}
      </span>

      <div className="loader-dial" aria-hidden="true">
        <svg viewBox="-100 -100 200 200">
          <circle className="loader-orbit" r="74" />
          {Array.from({ length: TICKS }, (_, i) => {
            const a = (i / TICKS) * Math.PI * 2;
            const major = i % 5 === 0;
            const r0 = major ? 80 : 84;
            const r1 = 90;
            return (
              <line
                key={i}
                ref={(el) => {
                  ticks.current[i] = el;
                }}
                className={major ? "loader-tick is-major" : "loader-tick"}
                x1={Math.sin(a) * r0}
                y1={-Math.cos(a) * r0}
                x2={Math.sin(a) * r1}
                y2={-Math.cos(a) * r1}
              />
            );
          })}
        </svg>
        <span className="loader-slit" />
      </div>

      <p className="loader-slogan" ref={slogan} />
      <p className="loader-meta">
        <span ref={code}>00:00:29:00</span>
        <span>
          <span ref={percent}>000</span> / 100
        </span>
      </p>
      <span className="sr-only">{t("loadingLabel")}</span>
    </div>
  );
}
