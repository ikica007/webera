import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

interface LoadingScreenProps {
  onComplete: () => void;
}

const wordsEn = ["Design", "Create", "Inspire"];
const wordsBs = ["Dizajniraj", "Stvori", "Inspiriši"];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const { language, t } = useLanguage();
  const currentWords = language === 'bs' ? wordsBs : wordsEn;

  useEffect(() => {
    // Word cycler
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % currentWords.length);
    }, 900);
    return () => clearInterval(wordInterval);
  }, [currentWords]);

  useEffect(() => {
    // Counter animation
    let startTime: number | null = null;
    const duration = 2700;
    let animationFrameId: number;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min((progress / duration) * 100, 100);
      
      setCount(Math.floor(percentage));

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setTimeout(onComplete, 400); // Delay before completing
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-8">
      {/* Top Left Label */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-xs text-muted uppercase tracking-[0.3em]"
      >
        Portfolio
      </motion.div>

      {/* Center Rotating Word */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80"
          >
            {currentWords[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="w-full flex flex-col items-end gap-4">
        {/* Counter */}
        <div className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums leading-none">
          {String(count).padStart(3, "0")}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-[3px] bg-stroke/50 overflow-hidden rounded-full">
          <div 
            className="h-full accent-gradient origin-left"
            style={{ 
              transform: `scaleX(${count / 100})`,
              boxShadow: "0 0 8px rgba(137, 170, 204, 0.35)"
            }}
          />
        </div>
      </div>
    </div>
  );
}
