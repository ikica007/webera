import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const projects = [
  {
    title: "Montana Shop",
    url: "https://montanashop.me",
    image: "/montana-shop.png",
    span: "md:col-span-7",
    aspect: "aspect-[4/3] md:aspect-[16/9]"
  },
  {
    title: "PowerM Max",
    url: "https://powerm-max.vercel.app",
    image: "/powermax.png",
    span: "md:col-span-5",
    aspect: "aspect-[4/3] md:aspect-square"
  },
  {
    title: "Cvjećara Šćekić",
    url: "https://www.cvjecarascekic.me/",
    image: "/cvjecara.png",
    span: "md:col-span-5",
    aspect: "aspect-[4/3] md:aspect-square"
  },
  {
    title: "PSC Knežević",
    url: "https://pscknezevicservis.me/",
    image: "/psc-knezevic.png",
    span: "md:col-span-7",
    aspect: "aspect-[4/3] md:aspect-[16/9]"
  },
  {
    title: "Vrata Radulović",
    url: "https://vrata-radulovic.vercel.app/",
    image: "/doors-radulovic.png",
    span: "md:col-span-7",
    aspect: "aspect-[4/3] md:aspect-[16/9]"
  },
  {
    title: "HP Line",
    url: "https://hp-line.vercel.app/",
    image: "/hp-line.png",
    span: "md:col-span-5",
    aspect: "aspect-[4/3] md:aspect-square"
  },
  {
    title: "Efen Izgradnja",
    url: "https://efen-izgradnja.vercel.app/",
    image: "/efen-izgradnja.png",
    span: "md:col-span-5",
    aspect: "aspect-[4/3] md:aspect-square"
  },
  {
    title: "Void Webdesign",
    url: "https://void-webdesign.vercel.app/",
    image: "/void-webdesign.png",
    span: "md:col-span-7",
    aspect: "aspect-[4/3] md:aspect-[16/9]"
  }
];

export function SelectedWorks() {
  const { language, t } = useLanguage();
  return (
    <section id="work" className="bg-bg py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 lg:px-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">{t('selectedWorks')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-primary tracking-tight leading-tight">
              {language === 'bs' ? 'Istaknuti' : 'Featured'} <span className="font-display italic">{language === 'bs' ? 'projekti' : 'projects'}</span>
            </h2>
            <p className="text-muted mt-4 max-w-sm">
              {t('selectedDesc')}
            </p>
          </div>
          
          <button className="hidden md:inline-flex group relative items-center gap-2 rounded-full px-5 py-2.5 text-sm text-text-primary">
            <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-0 group-hover:opacity-100 transition-opacity -z-10 animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-0 rounded-full bg-surface border border-stroke group-hover:border-transparent transition-colors -z-10" />
            {language === 'bs' ? 'Vidi sve radove' : 'View all work'} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {projects.map((project, idx) => (
            <a 
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              key={idx} 
              className={`group relative rounded-3xl overflow-hidden bg-surface border border-stroke block ${project.span} ${project.aspect}`}
            >
              {/* Background Image */}
              <img 
                src={project.image} 
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Halftone Overlay */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "4px 4px"
                }}
              />
              
              {/* Hover Darken + Blur */}
              <div className="absolute inset-0 bg-bg/70 opacity-0 group-hover:opacity-100 backdrop-blur-lg transition-all duration-500" />
              
              {/* Hover Content */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className="relative rounded-full bg-white px-4 py-3 border border-transparent hover:border-transparent cursor-pointer hover:scale-105 transition-transform">
                  <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-100 -z-10 animate-gradient-shift bg-[length:200%_200%]" />
                  <div className="absolute inset-0 rounded-full bg-white -z-10" />
                  <span className="text-bg text-sm font-medium">
                    {language === 'bs' ? 'Vidi' : 'View'} — <span className="font-display italic text-base ml-1">{project.title}</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
