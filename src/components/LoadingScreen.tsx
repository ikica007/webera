import { useEffect, useRef, useState } from "react";
import { loadState } from "../lib/engine";
import { useLanguage } from "../context/LanguageContext";

const COLS = 35;
const ROWS = 17;

/** Brojčanik od znakova: crtice se pale u smjeru kazaljke kako film stiže. */
function dial(progress: number) {
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  const label = String(Math.round(progress * 100)).padStart(3, "0");
  let out = "";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const dx = (col - cx) * 0.5;
      const dy = row - cy;
      const distance = Math.hypot(dx, dy);
      if (row === cy && Math.abs(col - cx) <= 1) {
        out += label[col - cx + 1];
      } else if (distance > 5.6 && distance < 8.2) {
        const angle = (Math.atan2(dx, -dy) / (Math.PI * 2) + 1) % 1;
        const tick = (row * 7 + col * 13) % 9 === 0;
        out += angle <= progress ? (tick ? "0" : "|") : "·";
      } else {
        out += " ";
      }
    }
    out += "\n";
  }
  return out;
}

/** Učitavanje: sat od znakova se puni dok kadrovi filma stižu. */
export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [leaving, setLeaving] = useState(false);
  const face = useRef<HTMLPreElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    let shown = 0;
    let last = -1;
    const began = performance.now();
    const tick = (now: number) => {
      const target = loadState.ready ? 1 : Math.min(0.9, 0.04 + loadState.progress * 0.86);
      shown += (target - shown) * 0.09;
      const step = Math.round(shown * 100);
      if (step !== last && face.current) {
        last = step;
        face.current.textContent = dial(step / 100);
      }
      if (loadState.ready && shown > 0.985 && now - began > 1200) {
        setLeaving(true);
        timer = window.setTimeout(() => done.current(), 950);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={leaving ? "loader is-leaving" : "loader"} role="status" aria-live="polite">
      <span className="loader-brand" aria-hidden="true">WebEra</span>
      <pre className="loader-dial" ref={face} aria-hidden="true">{dial(0)}</pre>
      <p className="loader-meta">{t("loadingLabel")}</p>
    </div>
  );
}
