import { useRef } from "react";
import { fly, local, phase, ramp, reducedMotion, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

const stats = [
  { value: 2, suffix: "+", label: "stat1" },
  { value: 20, suffix: "+", label: "stat2" },
  { value: 1000, suffix: "%", label: "stat3" },
];

/** Brojke: broje se skrolom. Vratiš skrol, vrate se i brojevi. */
export function Stats() {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const numbers = useRef<(HTMLSpanElement | null)[]>([]);

  useFrame(({ u }) => {
    const n = local("numbers", u);
    fly(root.current, phase(-0.04, 1.03, 0.15, n), 0.8);
    if (n < -0.1 || n > 1.1) return;
    numbers.current.forEach((el, i) => {
      if (!el) return;
      const k = reducedMotion ? 1 : ramp(0.1 + i * 0.05, 0.42 + i * 0.07, n);
      const value = String(Math.round(stats[i].value * k));
      if (el.textContent !== value) el.textContent = value;
    });
  });

  return (
    <section className="layer stats">
      <div className="stats-inner" ref={root}>
        <h2 className="section-title">{t("statsTitle")}</h2>
        <dl className="stats-row">
          {stats.map((stat, i) => (
            <div className="stat" key={stat.label}>
              <dd>
                <span
                  ref={(el) => {
                    numbers.current[i] = el;
                  }}
                >
                  {stat.value}
                </span>
                {stat.suffix}
              </dd>
              <dt>{t(stat.label)}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
