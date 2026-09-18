import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { ElasticGallery, ElasticItemProps } from "./ui/elastic-gallery";

const projects: ElasticItemProps[] = [
  {
    id: "01",
    title: "Montana Shop",
    category: "E-Commerce",
    src: "/montana-shop.png",
    alt: "Montana Shop",
    url: "https://montanashop.me",
  },
  {
    id: "02",
    title: "PowerM Max",
    category: "Fitness & Brand",
    src: "/powermax.png",
    alt: "PowerM Max",
    url: "https://powerm-max.vercel.app",
  },
  {
    id: "03",
    title: "Cvjećara Šćekić",
    category: "Floral Boutique",
    src: "/cvjecara.png",
    alt: "Cvjećara Šćekić",
    url: "https://www.cvjecarascekic.me/",
  },
  {
    id: "04",
    title: "PSC Knežević",
    category: "Automotive Service",
    src: "/psc-knezevic.png",
    alt: "PSC Knežević",
    url: "https://pscknezevicservis.me/",
  },
  {
    id: "05",
    title: "Vrata Radulović",
    category: "Industrial & Doors",
    src: "/doors-radulovic.png",
    alt: "Vrata Radulović",
    url: "https://vrata-radulovic.vercel.app/",
  },
  {
    id: "06",
    title: "HP Line",
    category: "Transport & Logistics",
    src: "/hp-line.png",
    alt: "HP Line",
    url: "https://hp-line.vercel.app/",
  },
  {
    id: "07",
    title: "Efen Izgradnja",
    category: "Civil Construction",
    src: "/efen-izgradnja.png",
    alt: "Efen Izgradnja",
    url: "https://efen-izgradnja.vercel.app/",
  },
  {
    id: "08",
    title: "Void Webdesign",
    category: "Creative Agency",
    src: "/void-webdesign.png",
    alt: "Void Webdesign",
    url: "https://void-webdesign.vercel.app/",
  }
];

export function SelectedWorks() {
  const { language, t } = useLanguage();

  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8 md:mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">{t('selectedWorks')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight">
            {language === 'bs' ? 'Istaknuti' : 'Featured'} <span className="font-display italic">{language === 'bs' ? 'projekti' : 'projects'}</span>
          </h2>
          <p className="text-muted mt-3 max-w-lg text-sm sm:text-base">
            {t('selectedDesc')}
          </p>
        </motion.div>

        {/* Elastic Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <ElasticGallery
            items={projects}
            viewLabel={language === "bs" ? "Posjeti sajt" : "View Project"}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default SelectedWorks;
