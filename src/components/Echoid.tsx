import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Echoid.css';

export function Echoid() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      const handleResize = () => {
        if (window.innerWidth >= 901) setMenuOpen(false);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  return (
    <section className="echoid-container" id="contact">
      <div className="echoid-media">
        <video
          className="echoid-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png"
        />
        <div className="echoid-scrim" />
      </div>

      <header className="echoid-nav">
        <a href="#hero" className="echoid-logo">{t('name')}</a>
      </header>

      <div className="echoid-body">
        <div className="echoid-panel">
          <div className="echoid-chip">[ {t('availableForProjects')} ]</div>
          <h1 className="echoid-h1">{t('name')}</h1>
          <p className="echoid-tagline">{t('readyToCollab')}</p>

          <div className="echoid-form">
            <button 
              type="button" 
              onClick={() => window.open('https://wa.me/38267313289', '_blank')} 
              className="echoid-btn echoid-btn--solid"
            >
              {language === 'bs' ? 'Kontaktiraj putem WhatsApp-a' : 'Contact via WhatsApp'}
            </button>
            <button 
              type="button" 
              onClick={() => window.location.href = 'mailto:dobardzicilijas123@gmail.com'} 
              className="echoid-btn echoid-btn--ghost"
            >
              {language === 'bs' ? 'Pošalji Email' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>

      <footer className="echoid-footer">
        {t('rightsReserved')}
      </footer>
    </section>
  );
}
