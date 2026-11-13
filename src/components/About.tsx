import { useRef } from "react";
import { fly, local, phase, ramp, reveal, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

/** Red teksta u maski: izlazi odozdo, odlazi gore. */
function Line({ text, lineRef }: { text: string; lineRef: (el: HTMLSpanElement | null) => void }) {
  return (
    <span className="mask-row">
      <span className="mask-line" ref={lineRef}>
        {text}
      </span>
    </span>
  );
}

/**
 * Ideja: dvije misli kao naslovi u časopisu. Prva stoji dolje lijevo,
 * druga gore desno. Redovi izlaze iz maske jedan za drugim.
 */
export function About() {
  const { t } = useLanguage();
  const beat1 = useRef<HTMLDivElement>(null);
  const beat2 = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const lines = useRef<(HTMLSpanElement | null)[]>([]);
  const set = (i: number) => (el: HTMLSpanElement | null) => {
    lines.current[i] = el;
  };

  useFrame(({ u }) => {
    const a = local("about", u);
    const show = (el: HTMLElement | null, on: boolean) => {
      if (el) el.style.visibility = on ? "visible" : "hidden";
    };
    show(beat1.current, a > -0.05 && a < 0.62);
    show(beat2.current, a > 0.45 && a < 0.96);
    if (a < -0.1 || a > 1.15) return;
    // svaki red: ulaz (od, do), izlaz (od, do)
    const timing: [number, number, number, number][] = [
      [0.02, 0.12, 0.44, 0.52],
      [0.07, 0.17, 0.46, 0.54],
      [0.52, 0.62, 0.84, 0.91],
      [0.57, 0.67, 0.86, 0.93],
    ];
    timing.forEach(([a0, a1, b0, b1], i) => {
      reveal(lines.current[i], ramp(a0, a1, a) - 1 + ramp(b0, b1, a));
    });
    if (text.current) {
      const k = ramp(0.16, 0.26, a) * (1 - ramp(0.42, 0.5, a));
      text.current.style.opacity = k.toFixed(3);
      text.current.style.transform = `translate3d(0, ${((1 - k) * 14).toFixed(1)}px, 0)`;
    }
  });

  return (
    <section className="layer manifest">
      <div className="manifest-beat is-low" ref={beat1}>
        <p className="manifest-label" data-scramble={`01 — ${t("chIdea")}`}>01 — {t("chIdea")}</p>
        <h2 className="manifest-line">
          <Line text={t("manifestA")} lineRef={set(0)} />
          <Line text={t("manifestB")} lineRef={set(1)} />
        </h2>
        <p className="manifest-text" ref={text}>{t("manifestText")}</p>
      </div>
      <div className="manifest-beat is-high" ref={beat2}>
        <p className="manifest-label" data-scramble={`02 — ${t("chTime")}`}>02 — {t("chTime")}</p>
        <p className="manifest-line">
          <Line text={t("manifestC")} lineRef={set(2)} />
          <Line text={t("manifestD")} lineRef={set(3)} />
        </p>
      </div>
    </section>
  );
}

/** Principi: četiri reda koja se pale jedan po jedan dok kamera prolazi kroz svjetlost. */
export function Principles() {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useFrame(({ u }) => {
    const q = local("principles", u);
    fly(root.current, phase(-0.04, 1.02, 0.14, q), 0.8);
    if (q < -0.1 || q > 1.1) return;
    rows.current.forEach((row, i) => {
      if (!row) return;
      const k = ramp(0.14 + i * 0.13, 0.25 + i * 0.13, q);
      row.style.opacity = (0.16 + 0.84 * k).toFixed(3);
      row.style.transform = `translate3d(0, ${((1 - k) * 16).toFixed(1)}px, 0)`;
      row.classList.toggle("is-lit", k > 0.5);
    });
  });

  return (
    <section className="layer principles">
      <div className="principles-inner" ref={root}>
        <div className="principles-box">
        <h2 className="section-title">{t("principlesTitle")}</h2>
        <ul className="principles-list">
          {[1, 2, 3, 4].map((n, i) => (
            <li
              className="principle"
              key={n}
              ref={(el) => {
                rows.current[i] = el;
              }}
            >
              <span className="principle-num" aria-hidden="true">0{n}</span>
              <h3>{t(`p${n}Title`)}</h3>
              <p>{t(`p${n}Desc`)}</p>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
