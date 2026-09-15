import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";
import { ArrowUpRight, Globe, Menu, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) {
      setDisplayText(text);
      return;
    }
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (letter === ' ') return ' ';
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
      });
      
      iteration += 1 / 2;
      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [isHovering, text]);

  return (
    <span 
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)}
      className="inline-block"
    >
      {displayText}
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "hero", label: t('home') },
    { id: "work", label: t('work') },
    { id: "about", label: t('aboutTitle') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'bs' ? 'en' : 'bs');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
        <div
          className={cn(
            "inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface px-2 py-2 transition-shadow duration-300",
            scrolled && "shadow-md shadow-black/10"
          )}
        >
          {/* Language Toggle (Desktop - Left side) */}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex group relative w-9 h-9 rounded-full items-center justify-center transition-transform hover:scale-110"
            title="Toggle Language"
          >
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] [animation-direction:normal] group-hover:[animation-direction:reverse] animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-[1.5px] rounded-full bg-bg flex items-center justify-center">
              <span className="font-display italic text-[13px] text-text-primary uppercase">
                {language === 'bs' ? 'SR' : 'EN'}
              </span>
            </div>
          </button>
          
          {/* Logo (Mobile - Left side) */}
          <div className="md:hidden group relative w-9 h-9 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] [animation-direction:normal] animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-[1.5px] rounded-full bg-bg flex items-center justify-center">
              <span className="font-display italic text-[13px] text-text-primary uppercase">
                {language === 'bs' ? 'SR' : 'EN'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-stroke mx-1 hidden md:block" />

          {/* Nav Links Desktop */}
          <div className="hidden md:flex items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-muted hover:text-text-primary hover:bg-stroke/50 transition-colors"
              >
                <ScrambleText text={item.label} />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-stroke mx-1 hidden md:block" />

          {/* Say Hi Button Desktop */}
          <button
            onClick={() => scrollTo("contact")}
            className="hidden md:flex group relative text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-text-primary transition-all ml-1"
          >
            <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_200%] animate-gradient-shift -z-10" />
            <div className="absolute inset-0 rounded-full bg-surface backdrop-blur-md -z-10 group-hover:bg-bg transition-colors" />
            <span className="flex items-center gap-1">
              <ScrambleText text={t('sayHi')} />
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden flex items-center justify-center w-9 h-9 ml-2 rounded-full text-text-primary hover:bg-stroke/50 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center">
          <button 
            className="absolute top-6 right-6 p-2 text-muted hover:text-text-primary transition-colors rounded-full bg-surface"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-2xl font-display italic text-text-primary hover:text-accent transition-colors"
              >
                <ScrambleText text={item.label} />
              </button>
            ))}
            
            <div className="w-12 h-px bg-stroke my-4" />

            <button
              onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
              className="text-lg text-muted hover:text-text-primary transition-colors"
            >
              <ScrambleText text={language === 'bs' ? 'Switch to English' : 'Prebaci na Bosanski'} />
            </button>

            <button
              onClick={() => scrollTo("contact")}
              className="mt-4 px-6 py-3 rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] text-bg font-medium"
            >
              {t('sayHi')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
