import { useEffect, useRef } from "react";
import { finePointer, pointer, useFrame } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

/** Prsten koji prati miš. Nad sajtom klijenta se širi u "Posjeti". */
export function Cursor() {
  const { t } = useLanguage();
  const ring = useRef<HTMLDivElement>(null);
  const position = useRef({ x: -200, y: -200 });

  useEffect(() => {
    if (!finePointer) return;
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const el = ring.current;
      if (!el || !target?.closest) return;
      el.classList.toggle("is-view", !!target.closest(".work-hit"));
      el.classList.toggle("is-link", !!target.closest("a, button") && !target.closest(".work-hit"));
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  useFrame(({ dt }) => {
    const el = ring.current;
    if (!el || !pointer.active) return;
    const follow = 1 - Math.exp(-dt * 16);
    position.current.x += (pointer.px - position.current.x) * follow;
    position.current.y += (pointer.py - position.current.y) * follow;
    el.style.opacity = "1";
    el.style.transform = `translate3d(${position.current.x.toFixed(1)}px, ${position.current.y.toFixed(1)}px, 0)`;
  });

  if (!finePointer) return null;
  return (
    <div className="cursor" ref={ring} aria-hidden="true">
      <span>{t("view")} ↗</span>
    </div>
  );
}
