import type { Rect } from "./stage";

export type Project = {
  title: string;
  category: { bs: string; en: string };
  src: string;
  url: string;
};

/**
 * Radovi. Da dodaš novi projekat: ubaci sliku u public/works i dodaj red ovdje.
 * Slike su .webp, široke 1600 px. Redoslijed ovdje je redoslijed na sajtu.
 */
export const projects: Project[] = [
  {
    title: "Montana Shop",
    category: { bs: "Online prodavnica muške mode", en: "Menswear online store" },
    src: "/works/montana-shop.webp",
    url: "https://montanashop.me",
  },
  {
    title: "PowerM Max",
    category: { bs: "Klima uređaji i toplotne pumpe", en: "Air conditioning and heat pumps" },
    src: "/works/powermax.webp",
    url: "https://powerm-max.vercel.app",
  },
  {
    title: "Cvjećara Šćekić",
    category: { bs: "Cvjećara", en: "Florist" },
    src: "/works/cvjecara.webp",
    url: "https://www.cvjecarascekic.me/",
  },
  {
    title: "PSC Knežević",
    category: { bs: "Auto servis", en: "Car service" },
    src: "/works/psc-knezevic.webp",
    url: "https://pscknezevicservis.me/",
  },
  {
    title: "Vrata Radulović",
    category: { bs: "Sobna i ulazna vrata", en: "Interior and entrance doors" },
    src: "/works/doors-radulovic.webp",
    url: "https://vrata-radulovic.vercel.app/",
  },
  {
    title: "HP Line",
    category: { bs: "Namještaj po mjeri", en: "Custom furniture" },
    src: "/works/hp-line.webp",
    url: "https://hp-line.vercel.app/",
  },
  {
    title: "Efen Izgradnja",
    category: { bs: "Građevina", en: "Construction" },
    src: "/works/efen-izgradnja.webp",
    url: "https://efen-izgradnja.vercel.app/",
  },
  {
    title: "Void Webdesign",
    category: { bs: "Web studio", en: "Web studio" },
    src: "/works/void-webdesign.webp",
    url: "https://void-webdesign.vercel.app/",
  },
];

export const COUNT = projects.length;
export const pad = (value: number) => String(value).padStart(2, "0");
export const domainOf = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const LEAD = 0.95;
const SPAN = COUNT - 1 + LEAD + 0.6;

/**
 * Koji je projekat u fokusu (decimalno) za napredak `w` kroz poglavlje radova.
 * Sinus usporava kretanje oko svakog projekta, da se zadrži pred posjetiocem.
 */
export function trackAt(w: number) {
  const linear = -LEAD + w * SPAN;
  return linear - (Math.sin(2 * Math.PI * linear) / (2 * Math.PI)) * 0.8;
}

/** Napredak kroz poglavlje na kojem je projekat `i` tačno u fokusu. */
export const focusAt = (i: number) => (i + LEAD) / SPAN;

/** Šta 3D scena trenutno prikazuje; čita ga sloj sa natpisima. */
export const worksView = { rect: null as Rect | null, active: -1 };
