import { useRef } from "react";
import { fly, local, ramp, rewind, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

const WHATSAPP_URL = "https://wa.me/38267313289";
const EMAIL = "dobardzicilijas123@gmail.com";

/** Kraj puta, van vremena: poziv iznad linije horizonta, dugmad ispod nje. */
export function Contact() {
  const { t } = useLanguage();
  const root = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);

  useFrame(({ u }) => {
    const c = local("contact", u);
    fly(root.current, ramp(0.1, 0.55, c) - 1, 0.9);
    if (footer.current) {
      const k = ramp(0.55, 0.85, c);
      footer.current.style.opacity = k.toFixed(3);
      footer.current.style.visibility = k > 0.01 ? "visible" : "hidden";
    }
  });

  return (
    <section className="layer contact">
      <div className="contact-stage" ref={root}>
        <div className="contact-top">
          <p className="contact-chip">
            <i aria-hidden="true" />
            {t("available")}
          </p>
          <h2 className="contact-title">{t("contactTitle")}</h2>
        </div>
        <div className="contact-bottom">
          <a className="btn btn-solid" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            {t("whatsapp")}
            <span className="sr-only"> ({t("opensNewTab")})</span>
          </a>
          <a className="btn btn-line" href={`mailto:${EMAIL}`}>
            {t("email")}
          </a>
        </div>
      </div>
      <footer className="site-footer" ref={footer}>
        <span>{t("rights")}</span>
        <button type="button" onClick={rewind}>
          {t("rewind")} <span aria-hidden="true">↑</span>
        </button>
      </footer>
    </section>
  );
}
