import { useRef } from "react";
import { clamp, pointer, ramp, reducedMotion, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

/**
 * Početak: ime je podijeljeno svjetlosnim procjepom iz snimka.
 * "Web" stoji lijevo od linije, "Era" desno. Skrol ih razmiče kao vrata
 * i kamera prolazi između njih.
 */
export function Hero({ entered }: { entered: boolean }) {
  const { t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const web = useRef<HTMLSpanElement>(null);
  const era = useRef<HTMLSpanElement>(null);
  const below = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  useFrame(({ u }) => {
    const section = root.current;
    if (!section) return;
    if (u > 1.5) {
      section.style.visibility = "hidden";
      return;
    }
    section.style.visibility = "visible";
    if (reducedMotion) {
      section.style.opacity = String(1 - ramp(0.5, 1.1, u));
      return;
    }
    const k = clamp(u / 1.1);
    const out = k * k * (3 - 2 * k);
    const fade = (1 - ramp(0.18, 0.78, k)).toFixed(3);
    const blur = k > 0.15 ? `blur(${((k - 0.15) * 14).toFixed(1)}px)` : "none";
    const scale = (1 + out * 1.5).toFixed(3);
    if (web.current && era.current) {
      web.current.style.transform = `translate3d(${(-out * 44).toFixed(2)}vw, 0, 0) scale(${scale})`;
      era.current.style.transform = `translate3d(${(out * 44).toFixed(2)}vw, 0, 0) scale(${scale})`;
      web.current.style.opacity = era.current.style.opacity = fade;
      web.current.style.filter = era.current.style.filter = blur;
    }
    if (below.current) {
      below.current.style.opacity = (1 - ramp(0, 0.32, k)).toFixed(3);
      below.current.style.transform = `translate3d(0, ${(k * 3).toFixed(2)}vh, 0)`;
    }
    if (hint.current) hint.current.style.opacity = (1 - ramp(0, 0.12, k)).toFixed(3);
    if (tilt.current) {
      tilt.current.style.transform =
        `rotateX(${(-pointer.y * 3).toFixed(3)}deg) rotateY(${(pointer.x * 4.5).toFixed(3)}deg)`;
    }
  });

  return (
    <section ref={root} className={entered ? "layer hero is-entered" : "layer hero"}>
      <div className="hero-tilt" ref={tilt}>
        <h1 className="hero-title">
          <span className="sr-only">WebEra. {t("slogan")}</span>
          <span className="hero-half hero-web" ref={web} aria-hidden="true">
            <span className="hero-mask">
              <span className="hero-word">Web</span>
            </span>
          </span>
          <span className="hero-gap" aria-hidden="true" />
          <span className="hero-half hero-era" ref={era} aria-hidden="true">
            <span className="hero-mask">
              <span className="hero-word">Era</span>
            </span>
          </span>
        </h1>
      </div>
      <div className="hero-below" ref={below}>
        <p className="hero-slogan hero-fade">{t("slogan")}</p>
        <p className="hero-desc hero-fade">{t("heroDesc")}</p>
      </div>
      <div className="hero-hint" ref={hint}>
        <p className="hero-fade">
          <span>{t("scrollShort")}</span>
          <i aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
