"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

export interface ElasticItemProps {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  url?: string;
  description?: string;
}

const defaultItems: ElasticItemProps[] = [
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
    category: "Civil & Construction",
    src: "/efen-izgradnja.png",
    alt: "Efen Izgradnja",
    url: "https://efen-izgradnja.vercel.app/",
  },
  {
    id: "08",
    title: "Void Webdesign",
    category: "Design Agency",
    src: "/void-webdesign.png",
    alt: "Void Webdesign",
    url: "https://void-webdesign.vercel.app/",
  },
];

interface ElasticGalleryProps {
  items?: ElasticItemProps[];
  className?: string;
  viewLabel?: string;
}

export function ElasticGallery({
  items = defaultItems,
  className,
  viewLabel = "Posjeti sajt",
}: ElasticGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || "01");

  return (
    <div className={cn("w-full py-4 md:py-6", className)}>
      {/* Container: Fiksna visina na desktopu, adaptivna na mobitelima */}
      <div className="mx-auto flex h-[620px] w-full flex-col gap-2 sm:gap-2.5 md:h-[560px] lg:h-[620px] md:flex-row md:gap-3">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveId(item.id)}
              onClick={() => {
                if (!isActive) {
                  setActiveId(item.id);
                } else if (item.url) {
                  window.open(item.url, "_blank", "noopener,noreferrer");
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveId(item.id);
                }
              }}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border border-stroke bg-surface",
                // Tranzicija za širenje/skupljanje
                "transition-[flex,filter] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]",
                // Aktivna kartica zauzima veći dio, neaktivne se skupljaju
                isActive ? "flex-[4] md:flex-[4.2]" : "flex-[1]",
                // Osvjetljenje
                isActive
                  ? "brightness-100 ring-1 ring-white/20 shadow-2xl"
                  : "brightness-[0.4] hover:brightness-75"
              )}
            >
              {/* Background slika */}
              <div className="absolute inset-0 h-full w-full overflow-hidden">
                <img
                  src={item.src}
                  alt={item.alt}
                  className={cn(
                    "h-full w-full object-cover object-top transition-transform duration-1000",
                    isActive ? "scale-100" : "scale-110"
                  )}
                />

                {/* Halftone tačkasti overlay */}
                <div
                  className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #000 1px, transparent 1px)",
                    backgroundSize: "4px 4px",
                  }}
                />

                {/* Gradijent za čitljivost teksta */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500",
                    isActive ? "opacity-100" : "opacity-70"
                  )}
                />
              </div>

              {/* Sadržaj kartice */}
              <div className="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end p-4 sm:p-5 md:p-6 lg:p-8">
                {/* Aktivni sadržaj (prikazuje se kad je otvorena) */}
                <div
                  className={cn(
                    "flex flex-col gap-2 transition-all duration-500 z-10",
                    isActive
                      ? "translate-y-0 opacity-100 delay-150"
                      : "translate-y-8 opacity-0 pointer-events-none"
                  )}
                >
                  {/* Kategorija i redni broj */}
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white backdrop-blur-md">
                      {item.category}
                    </span>
                    <span className="text-white/40 text-xs font-mono">
                      {item.id} / 0{items.length}
                    </span>
                  </div>

                  {/* Naslov */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white font-display italic leading-none">
                    {item.title}
                  </h3>

                  {/* Dugme za posjetu */}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 sm:mt-3 inline-flex items-center gap-2.5 rounded-full bg-white/10 border border-white/20 hover:bg-white hover:text-black px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white transition-all w-fit group/btn backdrop-blur-sm"
                    >
                      <span>{viewLabel}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                  )}
                </div>

                {/* Neaktivni sadržaj (vertikalni tekst na desktopu) */}
                <div
                  className={cn(
                    "absolute transition-all duration-500 pointer-events-none z-10",
                    "bottom-3 left-1/2 -translate-x-1/2 md:bottom-6",
                    isActive ? "opacity-0 scale-50" : "opacity-100 delay-200"
                  )}
                >
                  {/* Desktop: Vertikalni naslov */}
                  <div className="hidden whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80 [writing-mode:vertical-rl] rotate-180 md:flex items-center gap-3">
                    <span className="text-[10px] text-white/40 font-mono">
                      {item.id}
                    </span>
                    <span className="font-display italic tracking-wide">
                      {item.title}
                    </span>
                  </div>

                  {/* Mobile: Horizontalni naslov */}
                  <div className="flex items-center gap-2 text-xs font-medium text-white/90 md:hidden">
                    <span className="text-[10px] text-white/40 font-mono">
                      {item.id}
                    </span>
                    <span className="truncate max-w-[180px] font-display italic text-sm">
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ElasticGallery;
