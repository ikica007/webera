import { useEffect, useRef } from "react";
import { finePointer, pointer, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

/**
 * Bez lažnog kursora: miš ostaje običan. Samo iznad sajta klijenta
 * se uz strelicu pojavi tanak natpis "Posjeti sajt".
 */
export function Cursor() {
  const { t } = useLanguage();
  const tag = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -200, y: -200 });

  useEffect(() => {
    if (!finePointer) return;
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      tag.current?.classList.toggle("is-on", !!target?.closest?.(".work-hit"));
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  useFrame(({ dt }) => {
    const el = tag.current;
    if (!el || !pointer.active) return;
    const follow = 1 - Math.exp(-dt * 22);
    position.current.x += (pointer.px - position.current.x) * follow;
    position.current.y += (pointer.py - position.current.y) * follow;
    el.style.transform = `translate3d(${position.current.x.toFixed(1)}px, ${position.current.y.toFixed(1)}px, 0)`;
  });

  if (!finePointer) return null;
  return (
    <div className="cursor-tag" ref={tag} aria-hidden="true">
      {t("visitSite")} ↗
    </div>
  );
}
