import { LEN, START, rewind, scrollToU } from "../lib/engine";
import { focusAt } from "../lib/works";
import { useLanguage } from "../context/LanguageContext";

export function Navbar({ entered }: { entered: boolean }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className={entered ? "nav is-entered" : "nav"}>
      <button type="button" className="nav-logo" onClick={rewind} aria-label="WebEra">
        WebEra
      </button>
      <div className="nav-right">
        <span className="nav-lang" role="group" aria-label="Jezik / Language">
          <button
            type="button"
            className={language === "bs" ? "is-on" : ""}
            aria-pressed={language === "bs"}
            onClick={() => setLanguage("bs")}
          >
            SR
          </button>
          <i aria-hidden="true">/</i>
          <button
            type="button"
            className={language === "en" ? "is-on" : ""}
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </span>
        <nav className="nav-pill" aria-label="Glavna navigacija">
          <button type="button" data-scramble={t("work")} onClick={() => scrollToU(START.work + focusAt(0) * LEN.work)}>
            {t("work")}
          </button>
          <i aria-hidden="true" />
          <button type="button" data-scramble={t("contact")} onClick={() => scrollToU(START.contact + LEN.contact)}>
            {t("contact")}
          </button>
        </nav>
      </div>
    </header>
  );
}
