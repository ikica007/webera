import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'bs' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // Navbar
    home: 'Home',
    work: 'Work',
    resume: 'Resume',
    sayHi: 'Say hi ↗',
    
    // Loading Screen
    loadingPre: 'WEBERA',
    loadingNum: '00',
    loadingRole: 'DESIGN / DEV',
    
    // Hero
    name: 'WebEra',
    slogan: 'Timeless design',
    heroDesc: 'Designing seamless digital interactions by focusing on the unique nuances which bring systems to life.',
    seeWorks: 'See Works',
    reachOut: 'Reach out...',
    scroll: 'SCROLL',

    // Selected Works
    selectedWorks: 'Selected Works',
    selectedDesc: 'Featured projects highlighting interaction and visual design.',
    viewProject: 'View Project',
    
    // Journal
    journal: 'Journal',
    journalDesc: 'Thoughts, learnings, and creative experiments.',
    readMore: 'Read Article',
    
    // Explorations
    explorations: 'Explorations',
    explorationsDesc: 'Visual experiments and creative coding sketches.',
    
    // About
    aboutTitle: 'About us',
    aboutSubtitle: 'Timeless design.',
    aboutText: "We strive to create websites that last, inspire, and deliver results, tailored exactly to our clients' wishes. We haven't been in the game for long, but we know time is on our side, because WebEra delivers timeless design.",

    // Stats
    statsTitle: 'By the numbers',
    statsDesc: 'A quick overview of my experience and impact.',
    
    // Echoid (Footer)
    readyToCollab: 'Ready to collaborate?',
    availableForProjects: 'Available for projects',
    rightsReserved: '© 2026 WebEra. All rights reserved.',
  },
  bs: {
    // Navbar
    home: 'Početna',
    work: 'Radovi',
    resume: 'Biografija',
    sayHi: 'Kontaktiraj nas ↗',
    
    // Loading Screen
    loadingPre: 'WEBERA',
    loadingNum: '00',
    loadingRole: 'DIZAJN / DEV',
    
    // Hero
    name: 'WebEra',
    slogan: 'Dizajn van vremena',
    heroDesc: 'Dizajniramo besprijekorne digitalne interakcije fokusirajući se na jedinstvene nijanse koje sistemima daju život.',
    seeWorks: 'Vidi Radove',
    reachOut: 'Kontaktiraj nas...',
    scroll: 'SKROLAJ',

    // Selected Works
    selectedWorks: 'Odabrani Radovi',
    selectedDesc: 'Istaknuti projekti koji naglašavaju interakciju i vizualni dizajn.',
    viewProject: 'Pogledaj Projekat',
    
    // Journal
    journal: 'Dnevnik',
    journalDesc: 'Razmišljanja, učenja i kreativni eksperimenti.',
    readMore: 'Pročitaj Članak',
    
    // Explorations
    explorations: 'Istraživanja',
    explorationsDesc: 'Vizualni eksperimenti i kreativno kodiranje.',
    
    // About
    aboutTitle: 'O nama',
    aboutSubtitle: 'Dizajn van vremena.',
    aboutText: 'Radimo na tome da pravimo websajtove koji traju, koji inspirišu, koji daju rezultat i to tačno po željama klijenata. Nismo dugo u igri, ali znamo da je vrijeme na našoj strani, jer WebEra daje dizajn van vremena.',

    // Stats
    statsTitle: 'U brojkama',
    statsDesc: 'Brzi pregled našeg iskustva i uticaja.',
    
    // Echoid (Footer)
    readyToCollab: 'Spremni za saradnju?',
    availableForProjects: 'Dostupni za projekte',
    rightsReserved: '© 2026 WebEra. Sva prava zadržana.',
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('bs');

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
