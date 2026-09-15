/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { SelectedWorks } from "./components/SelectedWorks";
import { About } from "./components/About";
import { Stats } from "./components/Stats";
import { Echoid } from "./components/Echoid";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Disable scrolling while loading
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLoading]);

  return (
    <div className="bg-bg min-h-screen text-text-primary selection:bg-white/20 overflow-x-hidden">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      {!isLoading && (
        <>
          <Navbar />
          <main>
            <Hero />
            <SelectedWorks />
            <About />
            <Stats />
            <Echoid />
          </main>
        </>
      )}
    </div>
  );
}
