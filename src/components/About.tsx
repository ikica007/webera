import { useEffect, useRef } from "react";
import { fly, local, phase, ramp, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

/** Rečenica razbijena na riječi, da se pale jedna po jedna dok skroluješ. */
function Words({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span className="mw" key={`${word}-${i}`}>
            {word}{" "}
          </span>
        ))}
      </span>
    </>
  );
}

const light = (words: HTMLElement[], from: number, to: number, x: number) => {
  const step = (to - from) / Math.max(1, words.length);
  words.forEach((word, i) => {
    const k = ramp(from + i * step, from + i * step + step * 1.6, x);
    word.style.opacity = (0.14 + 0.86 * k).toFixed(3);
  });
};

/** Ideja: dvije misli koje dolaze iz dubine i prolete pored kamere. */
export function About() {
  const { language, t } = useLanguage();
  const beat1 = useRef<HTMLDivElement>(null);
  const beat2 = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const words = useRef<{ a: HTMLElement[]; b: HTMLElement[] }>({ a: [], b: [] });

  useEffect(() => {
    words.current = {
      a: Array.from(beat1.current?.querySelectorAll<HTMLElement>(".mw") || []),
      b: Array.from(beat2.current?.querySelectorAll<HTMLElement>(".mw") || []),
    };
  }, [language]);

  useFrame(({ u }) => {
    const a = local("about", u);
    fly(beat1.current, phase(-0.02, 0.52, 0.13, a));
    fly(beat2.current, phase(0.5, 1.03, 0.13, a));
    if (a < -0.1 || a > 1.1) return;
    light(words.current.a, 0.07, 0.24, a);
    light(words.current.b, 0.6, 0.76, a);
    if (text.current) {
      const k = ramp(0.25, 0.33, a);
      text.current.style.opacity = k.toFixed(3);
      text.current.style.transform = `translate3d(0, ${((1 - k) * 22).toFixed(1)}px, 0)`;
    }
  });

  return (
    <section className="layer manifest">
      <div className="manifest-beat" ref={beat1}>
        <h2 className="manifest-line">
          <span className="manifest-row"><Words text={t("manifestA")} /></span>
          <span className="manifest-row"><Words text={t("manifestB")} /></span>
        </h2>
        <p className="manifest-text" ref={text}>{t("manifestText")}</p>
      </div>
      <div className="manifest-beat" ref={beat2}>
        <p className="manifest-line">
          <span className="manifest-row"><Words text={t("manifestC")} /></span>
          <span className="manifest-row"><Words text={t("manifestD")} /></span>
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
