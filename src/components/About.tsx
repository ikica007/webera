import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { Target, Zap, Clock, Shield } from "lucide-react";

export function About() {
  const { language, t } = useLanguage();

  const values = [
    {
      icon: <Zap className="w-5 h-5 text-accent" />,
      title: language === 'bs' ? 'Brzina i Optimizacija' : 'Speed & Optimization',
      desc: language === 'bs' ? 'Sajtovi koji se učitavaju u treptaju oka, sa čistim i optimizovanim kodom.' : 'Websites that load in the blink of an eye, with clean and optimized code.'
    },
    {
      icon: <Target className="w-5 h-5 text-accent" />,
      title: language === 'bs' ? 'Fokus na Konverzije' : 'Focus on Conversions',
      desc: language === 'bs' ? 'Dizajn koji nije samo lijep, već strateški vodi korisnika ka cilju.' : 'Design that is not just beautiful, but strategically guides the user to the goal.'
    },
    {
      icon: <Shield className="w-5 h-5 text-accent" />,
      title: language === 'bs' ? 'Sigurnost i Stabilnost' : 'Security & Stability',
      desc: language === 'bs' ? 'Koristimo moderne tehnologije koje garantuju dugoročnu stabilnost.' : 'We use modern technologies that guarantee long-term stability.'
    },
    {
      icon: <Clock className="w-5 h-5 text-accent" />,
      title: language === 'bs' ? 'Dizajn Van Vremena' : 'Timeless Design',
      desc: language === 'bs' ? 'Estetika koja ne prati samo kratkotrajne trendove, već traje godinama.' : 'Aesthetics that do not just follow short-lived trends, but last for years.'
    }
  ];

  return (
    <section id="about" className="bg-bg py-20 md:py-32 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-16 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start mb-20">
          
          {/* Left Column - Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">{t('aboutTitle')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight font-display italic leading-tight mb-6">
              {t('aboutSubtitle')}
            </h2>
            <div className="w-20 h-1 bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] rounded-full" />
          </motion.div>

          {/* Right Column - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-7 lg:pl-8"
          >
            <p className="text-lg sm:text-xl md:text-2xl text-text-primary leading-relaxed font-light mb-8">
              {language === 'bs' ? (
                <>
                  Radimo na tome da pravimo websajtove koji <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">traju</span>, koji <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">inspirišu</span>, koji daju <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">rezultat</span> i to tačno po željama klijenata. 
                </>
              ) : (
                <>
                  We strive to create websites that <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">last</span>, that <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">inspire</span>, that deliver <span className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] font-medium">results</span>, tailored exactly to our clients' wishes. 
                </>
              )}
            </p>
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              {language === 'bs' ? (
                "Nismo dugo u igri, ali znamo da je vrijeme na našoj strani, jer WebEra daje dizajn van vremena. Svaki projekat je priča za sebe, a mi smo tu da je ispričamo na najbolji mogući način, kombinujući najnovije web tehnologije sa besprijekornom estetikom."
              ) : (
                "We haven't been in the game for long, but we know time is on our side, because WebEra delivers timeless design. Every project is a story in itself, and we are here to tell it in the best possible way, combining the latest web technologies with flawless aesthetics."
              )}
            </p>
          </motion.div>
          
        </div>

        {/* Value Props Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-12">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-surface border border-stroke p-6 lg:p-8 rounded-3xl hover:border-accent/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {value.icon}
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-3">{value.title}</h3>
              <p className="text-muted leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
    </section>
  );
}
