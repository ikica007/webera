/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useLayoutEffect, useState } from "react";
import { Backdrop } from "./components/Backdrop";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { Hud } from "./components/Hud";
import { Cursor } from "./components/Cursor";
import { Hero } from "./components/Hero";
import { About, Principles } from "./components/About";
import { SelectedWorks } from "./components/SelectedWorks";
import { Stats } from "./components/Stats";
import { Contact } from "./components/Contact";
import { CHAPTERS } from "./lib/engine";

/**
 * Sajt je jedan neprekidan kadar. Sve što se vidi stoji na ekranu (Backdrop +
 * slojevi sa tekstom), a skrol samo pomjera vrijeme. Dužinu svakog dijela
 * određuje lista CHAPTERS u src/lib/engine.ts.
 */
export default function App() {
  const [entered, setEntered] = useState(false);

  // Sajt uvijek kreće od početka snimka.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Visina ekrana se pamti jednom, da adresna traka na telefonu ne pomjera vrijeme.
  useLayoutEffect(() => {
    let lastWidth = 0;
    const setUnit = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      document.documentElement.style.setProperty("--unit", `${window.innerHeight}px`);
    };
    setUnit();
    window.addEventListener("resize", setUnit);
    return () => window.removeEventListener("resize", setUnit);
  }, []);

  // Dok traje učitavanje, skrol je zaključan.
  useEffect(() => {
    document.documentElement.classList.toggle("is-locked", !entered);
  }, [entered]);

  return (
    <>
      <Backdrop />
      <main className="ui">
        <Hero entered={entered} />
        <About />
        <SelectedWorks />
        <Principles />
        <Stats />
        <Contact />
      </main>
      <Navbar entered={entered} />
      <Hud entered={entered} />
      <Cursor />

      {/* Prazna traka koja daje dužinu skrola; svako poglavlje ima svoj dio. */}
      <div className="track" aria-hidden="true">
        {CHAPTERS.map((chapter, i) => (
          <div
            key={chapter.id}
            id={chapter.id}
            style={{
              height: `calc(var(--unit, 100vh) * ${chapter.len + (i === CHAPTERS.length - 1 ? 1 : 0)})`,
            }}
          />
        ))}
      </div>

      {!entered && <LoadingScreen onDone={() => setEntered(true)} />}
    </>
  );
}
