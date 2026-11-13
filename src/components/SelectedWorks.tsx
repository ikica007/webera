import { useRef } from "react";
import { LEN, START, clamp, local, ramp, reducedMotion, scrollToU, useFrame } from "../lib/engine";
import { COUNT, domainOf, focusAt, pad, projects, trackAt, worksView } from "../lib/works";
import { useLanguage } from "../context/LanguageContext";
import { scramble } from "../lib/scramble";

/**
 * Radovi: natpisi i listanje uz 3D panele. Same panele crta WebGL scena
 * (Backdrop), a lista projekata je u src/lib/works.ts.
 */
export function SelectedWorks() {
  const { language, t } = useLanguage();
  const head = useRef<HTMLElement>(null);
  const pager = useRef<HTMLDivElement>(null);
  const pagerName = useRef<HTMLSpanElement>(null);
  const captions = useRef<(HTMLDivElement | null)[]>([]);
  const hit = useRef<HTMLAnchorElement>(null);
  const shownIndex = useRef(-1);
  const current = useRef(0);

  const go = (step: number) => {
    const next = clamp(current.current + step, 0, COUNT - 1);
    scrollToU(START.work + focusAt(next) * LEN.work);
  };

  useFrame(({ u }) => {
    const w = local("work", u);
    const on = ramp(-0.03, 0.02, w) * (1 - ramp(0.955, 0.995, w));
    const visible = on > 0.004 ? "visible" : "hidden";
    if (head.current) {
      // naslov poglavlja se sklanja čim prvi projekat dođe u fokus
      const intro = on * (1 - ramp(0.05, 0.1, w));
      head.current.style.opacity = intro.toFixed(3);
      head.current.style.visibility = intro > 0.004 ? "visible" : "hidden";
    }
    const track = trackAt(w);
    const nearest = clamp(Math.round(track), 0, COUNT - 1);
    if (pager.current) {
      pager.current.style.opacity = on.toFixed(3);
      pager.current.style.visibility = visible;
    }
    if (nearest !== current.current || !pagerName.current?.textContent) {
      current.current = nearest;
      if (pagerName.current) {
        scramble(pagerName.current, `${pad(nearest + 1)}. ${projects[nearest].title}`);
      }
    }
    captions.current.forEach((el, i) => {
      if (!el) return;
      const d = track - i;
      const opacity = (1 - ramp(0.18, 0.44, Math.abs(d))) * on;
      if (opacity < 0.004) {
        if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      el.style.opacity = opacity.toFixed(3);
      el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      if (!reducedMotion) el.style.transform = `translate3d(0, ${(-d * 46).toFixed(1)}px, 0)`;
    });

    // Nevidljivi link preko panela u fokusu: klik na sajt otvara sajt.
    const link = hit.current;
    if (!link) return;
    const rect = worksView.rect;
    if (rect && on > 0.5) {
      link.style.display = "block";
      link.style.transform = `translate3d(${rect.x.toFixed(1)}px, ${rect.y.toFixed(1)}px, 0)`;
      link.style.width = `${rect.w.toFixed(1)}px`;
      link.style.height = `${rect.h.toFixed(1)}px`;
      if (shownIndex.current !== worksView.active) {
        shownIndex.current = worksView.active;
        link.href = projects[worksView.active].url;
      }
    } else if (link.style.display !== "none") {
      link.style.display = "none";
    }
  });

  return (
    <section className="layer works">
      <header className="works-head" ref={head}>
        <h2 className="section-title">{t("worksTitle")}</h2>
        <p>{t("worksDesc")}</p>
      </header>

      <div className="work-pager" ref={pager}>
        <button type="button" onClick={() => go(-1)} aria-label={t("prevWork")}>
          &lt;&lt;
        </button>
        <span ref={pagerName} />
        <button type="button" onClick={() => go(1)} aria-label={t("nextWork")}>
          &gt;&gt;
        </button>
      </div>

      <a
        ref={hit}
        className="work-hit"
        href={projects[0].url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
      />

      {projects.map((project, i) => (
        <div
          key={project.title}
          className="work-caption"
          ref={(el) => {
            captions.current[i] = el;
          }}
        >
          <div className="work-meta">
            <p className="work-count">
              <span>{pad(i + 1)}</span> / {pad(COUNT)}
            </p>
            <h3>{project.title}</h3>
            <p className="work-cat">
              {project.category[language]}
              <span>{domainOf(project.url)}</span>
            </p>
          </div>
          <a className="btn btn-line" href={project.url} target="_blank" rel="noopener noreferrer">
            {t("visitSite")} <span aria-hidden="true">↗</span>
            <span className="sr-only"> ({t("opensNewTab")})</span>
          </a>
        </div>
      ))}
    </section>
  );
}
