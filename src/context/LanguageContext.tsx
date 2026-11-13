import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'bs' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

/** Svi tekstovi na sajtu. Mijenjaj ih ovdje, na oba jezika. */
const translations: Translations = {
  bs: {
    // Navigacija
    work: 'Radovi',
    about: 'O nama',
    contact: 'Kontakt',

    // Učitavanje
    loadingLabel: 'Učitavanje',

    // Početak
    slogan: 'Dizajn van vremena',
    heroDesc: 'Sajtovi koji ne stare. I koji prodaju.',
    scrollHint: 'Skroluj. Vrijeme je u tvojim rukama.',
    scrollShort: 'Skroluj',

    // Ideja
    manifestA: 'Trendovi prolaze.',
    manifestB: 'Dobar dizajn ostaje.',
    manifestText:
      'Radimo na tome da pravimo websajtove koji traju, koji inspirišu, koji daju rezultat, i to tačno po željama klijenata.',
    manifestC: 'Nismo dugo u igri.',
    manifestD: 'Ali vrijeme je na našoj strani.',

    // Radovi
    worksTitle: 'Odabrani radovi',
    worksDesc: 'Svaki projekat je priča za sebe.',
    visitSite: 'Posjeti sajt',
    view: 'Posjeti',
    opensNewTab: 'otvara se u novom tabu',
    prevWork: 'Prethodni projekat',
    nextWork: 'Sljedeći projekat',

    // Principi
    principlesTitle: 'Zašto naš dizajn traje',
    p1Title: 'Brzina i optimizacija',
    p1Desc: 'Sajtovi koji se učitavaju u treptaju oka, sa čistim i optimizovanim kodom.',
    p2Title: 'Fokus na konverzije',
    p2Desc: 'Dizajn koji nije samo lijep, već strateški vodi korisnika ka cilju.',
    p3Title: 'Sigurnost i stabilnost',
    p3Desc: 'Koristimo moderne tehnologije koje garantuju dugoročnu stabilnost.',
    p4Title: 'Dizajn van vremena',
    p4Desc: 'Estetika koja ne prati samo kratkotrajne trendove, već traje godinama.',

    // Brojke
    statsTitle: 'U brojkama',
    stat1: 'godine iskustva',
    stat2: 'završenih projekata',
    stat3: 'zadovoljnih klijenata',

    // Kontakt
    available: 'Dostupni za projekte',
    contactTitle: 'Spremni za saradnju?',
    whatsapp: 'Piši nam na WhatsApp',
    email: 'Pošalji email',
    rewind: 'Vrati vrijeme na početak',
    rights: '© 2026 WebEra. Sva prava zadržana.',

    // Poglavlja na vremenskoj liniji
    chStart: 'Početak',
    chIdea: 'Ideja',
    chTime: 'Vrijeme',
    chWork: 'Radovi',
    chPrinciples: 'Principi',
    chNumbers: 'Brojke',
    chContact: 'Kontakt',
    chBeyond: 'Van vremena',
    timeline: 'Vremenska linija',
  },
  en: {
    work: 'Work',
    about: 'About',
    contact: 'Contact',

    loadingLabel: 'Loading',

    slogan: 'Timeless design',
    heroDesc: "Websites that don't age. And that sell.",
    scrollHint: 'Scroll. Time is in your hands.',
    scrollShort: 'Scroll',

    manifestA: 'Trends pass.',
    manifestB: 'Good design stays.',
    manifestText:
      'We build websites that last, that inspire and that deliver results, tailored exactly to what our clients want.',
    manifestC: "We haven't been in the game for long.",
    manifestD: 'But time is on our side.',

    worksTitle: 'Selected work',
    worksDesc: 'Every project is a story of its own.',
    visitSite: 'Visit site',
    view: 'Visit',
    opensNewTab: 'opens in a new tab',
    prevWork: 'Previous project',
    nextWork: 'Next project',

    principlesTitle: 'Why our design lasts',
    p1Title: 'Speed and optimization',
    p1Desc: 'Websites that load in the blink of an eye, with clean and optimized code.',
    p2Title: 'Focus on conversions',
    p2Desc: 'Design that is not just beautiful, but strategically guides the visitor to the goal.',
    p3Title: 'Security and stability',
    p3Desc: 'We use modern technologies that guarantee long-term stability.',
    p4Title: 'Timeless design',
    p4Desc: 'An aesthetic that does not chase short-lived trends, but lasts for years.',

    statsTitle: 'By the numbers',
    stat1: 'years of experience',
    stat2: 'projects completed',
    stat3: 'satisfied clients',

    available: 'Available for projects',
    contactTitle: 'Ready to work together?',
    whatsapp: 'Message us on WhatsApp',
    email: 'Send an email',
    rewind: 'Rewind time to the start',
    rights: '© 2026 WebEra. All rights reserved.',

    chStart: 'Start',
    chIdea: 'Idea',
    chTime: 'Time',
    chWork: 'Work',
    chPrinciples: 'Principles',
    chNumbers: 'Numbers',
    chContact: 'Contact',
    chBeyond: 'Beyond time',
    timeline: 'Timeline',
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('bs');

  useEffect(() => {
    document.documentElement.lang = language === 'bs' ? 'sr-Latn' : 'en';
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
