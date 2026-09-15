import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

const statsEn = [
  {
    value: "2+",
    label: "Years Experience"
  },
  {
    value: "20+",
    label: "Projects Done"
  },
  {
    value: "1000%",
    label: "Satisfied Clients"
  }
];

const statsBs = [
  {
    value: "2+",
    label: "Godine Iskustva"
  },
  {
    value: "20+",
    label: "Završenih Projekata"
  },
  {
    value: "1000%",
    label: "Zadovoljnih Klijenata"
  }
];

export function Stats() {
  const { language, t } = useLanguage();
  const currentStats = language === 'bs' ? statsBs : statsEn;

  return (
    <section className="bg-bg py-16 md:py-24 border-y border-stroke">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-16">
        <div className="text-center mb-16">
          <span className="text-xs text-muted uppercase tracking-[0.3em] block mb-4">{t('statsTitle')}</span>
          <p className="text-muted">{t('statsDesc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-stroke">
          {currentStats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center pt-8 md:pt-0"
            >
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display italic text-text-primary mb-4 bg-clip-text text-transparent bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)]">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-muted uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
