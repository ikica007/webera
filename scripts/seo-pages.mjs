/**
 * WebEra — statične SEO stranice.
 *
 * Pokretanje:  node scripts/seo-pages.mjs
 * Pravi HTML stranice u public/ (usluge, radovi, o nama, kontakt),
 * sitemap.xml i robots.txt. Tekstove mijenjaj ovdje, pa pokreni ponovo.
 * Email i WhatsApp se čitaju iz src/components/Contact.tsx, da budu isti svuda.
 *
 * Pravilo: samo stvarni podaci. Bez izmišljenih recenzija, cijena i rezultata.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = "https://webera.website";
const ROOT = new URL("../", import.meta.url).pathname;
const OUT = join(ROOT, "public");
const contactSource = readFileSync(join(ROOT, "src/components/Contact.tsx"), "utf8");
const EMAIL = contactSource.match(/const EMAIL = "([^"]+)"/)[1];
const WHATSAPP = contactSource.match(/const WHATSAPP_URL = "([^"]+)"/)[1];
const PHONE = "+" + WHATSAPP.replace(/\D/g, "");
const PHONE_PRETTY = PHONE.replace(/^\+(\d{3})(\d{2})(\d{3})(\d+)$/, "+$1 $2 $3 $4");
const INSTAGRAM = "https://www.instagram.com/webera_design/";
const TODAY = new Date().toISOString().slice(0, 10);

const NAV = [
  ["/services", "Usluge"],
  ["/work", "Radovi"],
  ["/about", "O nama"],
  ["/contact", "Kontakt"],
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ORG = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE}/#webera`,
  name: "WebEra",
  slogan: "Dizajn van vremena",
  description: "Web dizajn i izrada web sajtova i online prodavnica za biznise iz Crne Gore, Srbije i BiH.",
  url: `${SITE}/`,
  logo: `${SITE}/apple-touch-icon.png`,
  image: `${SITE}/og-image.jpg`,
  email: EMAIL,
  telephone: PHONE,
  address: { "@type": "PostalAddress", addressLocality: "Podgorica", addressCountry: "ME" },
  areaServed: ["Crna Gora", "Srbija", "Bosna i Hercegovina"],
  sameAs: [INSTAGRAM],
};

function page({ path, title, description, crumbs, body, schema = [] }) {
  const url = `${SITE}${path}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["/", "WebEra"], ...crumbs].map(([href, name], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}${href}`,
    })),
  };
  const jsonld = [ORG, breadcrumb, ...schema]
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join("\n    ");
  const crumbHtml = [["/", "WebEra"], ...crumbs]
    .map(([href, name], i, all) =>
      i === all.length - 1 ? `<span aria-current="page">${esc(name)}</span>` : `<a href="${href}">${esc(name)}</a>`,
    )
    .join(" <i>/</i> ");

  return `<!doctype html>
<html lang="sr-Latn">
  <head>
    <meta charset="UTF-8" />
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-TDVP9PV8"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050608" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="sr_ME" />
    <meta property="og:site_name" content="WebEra" />
    <meta property="og:image" content="${SITE}/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Orbitron:wght@400;500&family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/pages.css" />
    ${jsonld}
  </head>
  <body>
    <header class="top">
      <a class="logo" href="/">WebEra</a>
      <nav class="pill" aria-label="Glavna navigacija">
        ${NAV.map(([href, name]) => `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ""}>${name}</a>`).join("\n        ")}
      </nav>
    </header>
    <main>
      <p class="crumbs">${crumbHtml}</p>
${body}
    </main>
    <footer class="foot">
      <div class="foot-cta">
        <p class="label">Dostupni za projekte</p>
        <p class="foot-title">Imate projekat? Napravimo ga.</p>
        <p class="actions">
          <a class="btn solid" href="${WHATSAPP}" target="_blank" rel="noopener">Piši nam na WhatsApp</a>
          <a class="btn line" href="mailto:${EMAIL}">Pošalji email</a>
        </p>
      </div>
      <nav class="foot-links" aria-label="Sve stranice">
        <a href="/services">Usluge</a>
        <a href="/web-design">Web dizajn</a>
        <a href="/web-development">Izrada web sajtova</a>
        <a href="/ecommerce">Izrada web shopa</a>
        <a href="/work">Radovi</a>
        <a href="/about">O nama</a>
        <a href="/contact">Kontakt i česta pitanja</a>
        <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
      </nav>
      <p class="fine">© ${new Date().getFullYear()} WebEra · Podgorica, Crna Gora · Dizajn van vremena</p>
    </footer>
    <script>
      // upit = klik na WhatsApp, email ili poziv; u Analyticsu se vidi kao generate_lead
      document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || typeof gtag !== "function") return;
        var h = a.getAttribute("href") || "";
        var m = h.indexOf("wa.me") > -1 ? "whatsapp" : h.indexOf("mailto:") === 0 ? "email" : h.indexOf("tel:") === 0 ? "telefon" : "";
        if (m) gtag("event", "generate_lead", { method: m, page_path: location.pathname });
      });
    </script>
  </body>
</html>
`;
}

const hero = (label, h1, lead) => `      <section class="hero">
        <p class="label">${esc(label)}</p>
        <h1>${h1}</h1>
        <p class="lead">${lead}</p>
      </section>`;

const list = (items) => `<ul class="ticks">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

const block = (title, html, id = "") => `      <section class="block"${id ? ` id="${id}"` : ""}>
        <h2>${title}</h2>
        ${html}
      </section>`;

/* ------------------------------------------------------------------ */
/* Radovi                                                              */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  { slug: "montana", title: "Montana Shop", cat: "Online prodavnica muške mode", img: "/works/montana-shop.webp", url: "https://montanashop.me", alt: "Montana Shop, online prodavnica muške mode iz Crne Gore, sajt izradio WebEra", study: true },
  { slug: "powerm-max", title: "PowerM Max", cat: "Klima uređaji i toplotne pumpe", img: "/works/powermax.webp", url: "https://powerm-max.vercel.app", alt: "PowerM Max, sajt za montažu i održavanje klima uređaja, izradio WebEra", study: true },
  { slug: "cvjecara-scekic", title: "Cvjećara Šćekić", cat: "Cvjećara sa online naručivanjem", img: "/works/cvjecara.webp", url: "https://www.cvjecarascekic.me/", alt: "Cvjećara Šćekić, sajt cvjećare sa online naručivanjem i plaćanjem karticom, izradio WebEra", study: true },
  { slug: "psc-knezevic", title: "PSC Knežević", cat: "Ovlašćeni Peugeot servis", img: "/works/psc-knezevic.webp", url: "https://pscknezevicservis.me/", alt: "PSC Knežević, sajt ovlašćenog Peugeot servisa u Crnoj Gori, izradio WebEra", study: true },
  { slug: "vrata-radulovic", title: "Vrata Radulović", cat: "Sobna i ulazna vrata", img: "/works/doors-radulovic.webp", url: "https://vrata-radulovic.vercel.app/", alt: "Vrata Radulović, sajt za sobna i ulazna vrata, izradio WebEra", study: true },
  { slug: "hp-line", title: "HP Line", cat: "Obrada pločastih materijala", img: "/works/hp-line.webp", url: "https://hp-line.vercel.app/", alt: "HP Line, sajt firme za obradu pločastih materijala u Crnoj Gori, izradio WebEra", study: true },
  { slug: "efen-izgradnja", title: "Efen Izgradnja", cat: "Građevinski materijal i izvođenje radova", img: "/works/efen-izgradnja.webp", url: "https://efen-izgradnja.vercel.app/", alt: "Efen Izgradnja, sajt za prodaju građevinskog materijala i izvođenje radova, izradio WebEra", study: true },
  { slug: "void-webdesign", title: "Void Webdesign", cat: "Web studio", img: "/works/void-webdesign.webp", url: "https://void-webdesign.vercel.app/", alt: "Void Webdesign, eksperimentalni 3D sajt web studija, izradio WebEra" },
];

const card = (p) => `<li class="card">
          <a class="shot" href="${p.study ? `/work/${p.slug}` : p.url}"${p.study ? "" : ' target="_blank" rel="noopener"'}>
            <img src="${p.img}" alt="${esc(p.alt)}" width="1600" height="866" loading="lazy" decoding="async" />
          </a>
          <p class="label">${esc(p.cat)}</p>
          <h3>${esc(p.title)}</h3>
          <p class="links">${p.study ? `<a href="/work/${p.slug}">Pročitaj studiju slučaja →</a>` : ""}<a href="${p.url}" target="_blank" rel="noopener">Posjeti sajt ↗</a></p>
        </li>`;

const grid = (items) => `<ul class="grid">
        ${items.map(card).join("\n        ")}
      </ul>`;

/*
 * Studije slučaja. Struktura: klijent, izazov, cilj, pristup, šta je napravljeno,
 * tehnologije i rezultat. Rezultat je samo ono što se stvarno promijenilo, bez brojeva
 * koje nemamo.
 */
const STUDIES = {
  montana: {
    lead: "Redizajn sajta i pokretanje online prodaje za porodični brend muške mode koji postoji od 1993. godine, sa prodavnicama u Bijelom Polju i Podgorici.",
    client: "Montana je porodični brend muške mode iz Crne Gore, osnovan 1993. godine. Pored svoje kolekcije prodaje i brendove kao što su Beverly Hills Polo Club, Tom Tailor, Fred Mello, Rifle i Navigare.",
    challenge: "Brend je imao sajt, ali bez online prodaje. Kupci su mogli vidjeti ponudu samo u radnjama, a kolekcije se mijenjaju svake sezone.",
    goal: "Da kupci iz cijele Crne Gore mogu pregledati i naručiti artikle online, i da se nove kolekcije redovno pojavljuju na sajtu.",
    approach: [
      "Kompletan redizajn sajta, čist i moderan, u skladu sa brendom",
      "Navigacija sa krugovima kategorija, inspirisana velikim modnim brendovima",
      "Katalog podijeljen na odjeću, obuću i aksesoare",
    ],
    built: [
      "Online prodavnica na WordPress i WooCommerce platformi",
      "Filteri po veličini i boji i brza pretraga artikala",
      "Unos artikala sa fotografijama i opisima",
      "Osnovni tehnički SEO i Google Search Console",
      "Stalno održavanje: sajt se redovno ažurira novim kolekcijama",
    ],
    tech: "WordPress, WooCommerce",
    result: "Montana sada ima online prodaju, a ponuda na sajtu prati ponudu u radnjama jer se sajt stalno ažurira novim kolekcijama.",
  },
  "powerm-max": {
    lead: "Sajt za novu firmu koja prodaje, montira i održava klima uređaje i toplotne pumpe u Bijelom Polju i Podgorici.",
    client: "PowerM Max je nova firma koja se bavi prodajom i montažom klima uređaja i toplotnih pumpi, dubinskim čišćenjem klima, dopunom freona i servisom.",
    challenge: "Kao nova firma, PowerM Max nije imao nijedan online kanal preko kojeg bi ga kupci pronašli.",
    goal: "Da posjetilac odmah vidi šta firma radi i da jednim dodirom pozove ili zatraži ponudu.",
    approach: [
      "Jasna poruka na početku: šta firma radi i gdje",
      "Dugmad za poziv i upit na svakom koraku",
      "Dizajn prilagođen prvo telefonu, jer većina upita stiže sa telefona",
    ],
    built: [
      "Početna strana sa pregledom usluga: montaža, servis, čišćenje i dopuna freona",
      "Brz kontakt preko telefona i WhatsApp-a",
      "Objava sajta i osnovni tehnički SEO",
    ],
    tech: "React, Vercel",
    result: "Firma je dobila svoj prvi online kanal: kupci je mogu pronaći, vidjeti usluge i javiti se direktno sa sajta.",
  },
  "cvjecara-scekic": {
    lead: "Novi sajt cvjećare na kojem kupci biraju bukete i aranžmane, naručuju ih i plaćaju karticom online.",
    client: "Cvjećara Šćekić pravi bukete, box aranžmane i cvjetne aranžmane za posebne prilike.",
    challenge: "Cvjećara nije imala online prodaju. Narudžbe su išle samo uživo ili telefonom.",
    goal: "Novi način prodaje cvijeća: da kupac izabere buket, naruči ga i plati bez poziva i bez dolaska u radnju.",
    approach: [
      "Elegantan izgled koji prati stil same cvjećare",
      "Jednostavan put od izbora buketa do plaćanja",
      "Katalog po kategorijama, pregledan i na telefonu",
    ],
    built: [
      "Katalog buketa i aranžmana po kategorijama",
      "Korpa i naručivanje online",
      "Plaćanje platnim karticama kroz integraciju sa platnim procesorom",
    ],
    tech: "React, Vercel, kartično plaćanje",
    result: "Cvjećara sada prodaje i online: kupci naručuju bukete i plaćaju karticom direktno na sajtu.",
  },
  "psc-knezevic": {
    lead: "Potpuno novi sajt za ovlašćenog Peugeot servisera za Crnu Goru.",
    client: "PSC Knežević je ovlašćeni Peugeot servis, zastupnik Peugeot servisa za Crnu Goru.",
    challenge: "Firma je imala stari sajt koji nije odgovarao nivou ovlašćenog servisa jednog velikog brenda.",
    goal: "Sajt koji izgleda kao ozbiljan, ovlašćeni servis i koji vlasniku vozila brzo daje usluge i kontakt.",
    approach: [
      "Novi dizajn u bojama i duhu Peugeot brenda",
      "Velike fotografije servisa i jasna struktura stranica",
      "Dugme za poziv uvijek pri ruci",
    ],
    built: [
      "Potpuno novi sajt umjesto starog",
      "Stranice o nama, usluge i kontakt",
      "Prilagođeno telefonu, sa direktnim pozivom",
    ],
    tech: "",
    result: "Servis je dobio moderan sajt koji odgovara statusu ovlašćenog Peugeot servisa, umjesto zastarjelog.",
  },
  "vrata-radulovic": {
    lead: "Sajt za firmu koja preko tri decenije prodaje i ugrađuje sobna i ulazna vrata.",
    client: "Vrata Radulović (Doors Lux & Bonvivan) preko 30 godina nudi sobna i ulazna vrata za stanove, kuće i poslovne prostore.",
    challenge: "Firma je dobro poznata i iskusna, ali bez sajta nije imala mjesto gdje novi kupci mogu vidjeti ponudu i nivo firme.",
    goal: "Sajt koji firmi daje ozbiljnost i nivo kakav ima uživo, i otvara još jedan kanal preko kojeg kupci dolaze.",
    approach: [
      "Tamni, filmski dizajn sa toplim svjetlom, da vrata izgledaju luksuzno",
      "Fokus na fotografijama modela",
      "Poziv na upit na svakom koraku",
    ],
    built: [
      "Pregled modela sobnih i ulaznih vrata",
      "Kontakt i upit za ponudu",
      "Sopstveni domen i objava sajta",
    ],
    tech: "React, Vercel",
    result: "Firma sa tri decenije iskustva sada i online izgleda kao premium ponuđač, i ima novi kanal za kupce.",
  },
  "hp-line": {
    lead: "Prvi sajt za veliku crnogorsku firmu za obradu pločastih materijala.",
    client: "HP Line je velika firma iz Crne Gore koja se bavi obradom pločastih materijala.",
    challenge: "Firma nije imala sajt, pa je kupci i partneri nisu mogli pronaći na internetu.",
    goal: "Predstaviti firmu, usluge i projekte čisto i premium, uz jasan put do kontakta.",
    approach: [
      "Svijetao, minimalan dizajn sa zlatnim akcentom iz loga",
      "Velika tipografija i poruka „Vaš dom, naša mjera.“",
      "Jasna struktura: o nama, usluge, projekti, kontakt",
    ],
    built: [
      "Prvi sajt firme, od nule",
      "Stranice o nama, usluge, projekti i kontakt",
      "Prilagođeno telefonu i spremno za Google",
    ],
    tech: "React, Vercel",
    result: "HP Line je dobio svoj prvi sajt i prisustvo na internetu.",
  },
  "efen-izgradnja": {
    lead: "Prvi sajt za firmu koja prodaje građevinski materijal i izvodi građevinske radove.",
    client: "Efen Izgradnja nudi sve za građevinski projekat na jednom mjestu: prodaju materijala, sa preko 10.000 artikala za sve faze gradnje i opremanja, i izvođenje radova, za kupce i firme širom Crne Gore.",
    challenge: "Firma uopšte nije imala sajt.",
    goal: "Da kupci i izvođači na jednom mjestu vide ponudu materijala i usluge izvođenja radova i lako zatraže ponudu.",
    approach: [
      "Snažan, tamni dizajn sa narandžastim akcentom iz loga",
      "Dva jasna puta: prodaja materijala i izvođenje radova",
      "Dugme „Zatraži ponudu“ uvijek vidljivo",
    ],
    built: [
      "Prvi sajt firme, od nule",
      "Stranice za prodaju, izvođenje radova, o nama i kontakt",
      "Upit za ponudu za radove",
    ],
    tech: "React, Vercel",
    result: "Efen Izgradnja je dobila prvi sajt, sa kojeg kupci mogu direktno tražiti ponudu.",
  },
};

/* ------------------------------------------------------------------ */
/* Stranice                                                            */
/* ------------------------------------------------------------------ */

const SERVICES = [
  ["/web-design", "Web dizajn", "Dizajn sajta koji izgleda kao vaš brend i vodi posjetioca do poziva ili kupovine."],
  ["/web-development", "Izrada web sajtova", "Brzi, moderni sajtovi po mjeri: od prezentacije firme do sajtova sa 3D animacijama."],
  ["/ecommerce", "Izrada web shopa", "Online prodavnice sa katalogom, korpom i plaćanjem karticom."],
];

const serviceLinks = `<ul class="services">
        ${SERVICES.map(([href, name, text]) => `<li><a href="${href}"><span class="label">→</span><strong>${name}</strong><span>${text}</span></a></li>`).join("\n        ")}
      </ul>`;

const PROCESS = `<ol class="steps">
          <li><strong>Razgovor</strong><span>Upoznamo vaš posao, kupce i šta sajt treba da postigne.</span></li>
          <li><strong>Dizajn</strong><span>Pravimo izgled i strukturu stranica i usklađujemo ih sa vama.</span></li>
          <li><strong>Izrada</strong><span>Sajt pravimo brz, prilagođen telefonu i spreman za Google.</span></li>
          <li><strong>Objava</strong><span>Pomažemo oko domena, objave i prijave sajta na Google.</span></li>
        </ol>`;

const FAQ = [
  ["Koliko košta izrada sajta?", "Cijena zavisi od broja stranica, funkcija (npr. web shop, plaćanje karticom, više jezika) i od toga ko priprema tekstove i fotografije. Pošaljite kratak opis na WhatsApp ili email i dobićete konkretnu ponudu."],
  ["Koliko traje izrada?", "Zavisi od obima projekta. Rok dogovaramo prije početka rada, kada znamo šta tačno sajt treba da ima."],
  ["Da li radite sa klijentima van Crne Gore?", "Da. Radimo sa firmama iz Crne Gore, Srbije i Bosne i Hercegovine, a saradnja ide preko poziva, WhatsApp-a i emaila."],
  ["Da li pomažete oko domena i hostinga?", "Da. Pomažemo oko izbora i kupovine domena i objave sajta, tako da sajt bude na vašoj adresi."],
  ["Da li održavate sajt poslije izrade?", "Da. Održavanje nudimo mjesečno ili po potrebi, uz naknadu: izmjene sadržaja, dodavanje artikala i novih kolekcija, tehničke provjere i ažuriranja."],
  ["Da li radite SEO?", "Svaki sajt dobija osnovni tehnički SEO: brzinu, ispravne naslove i opise, mapu sajta i prijavu u Google Search Console. Napredni SEO radimo kao posebnu uslugu, jer traži istraživanje šta ljudi zaista kucaju kad traže vašu uslugu, pisanje sadržaja i praćenje rezultata."],
  ["Da li radite web shop?", "Da. Pravimo online prodavnice sa katalogom, filterima, korpom i plaćanjem karticom. Primjeri su Montana Shop i Cvjećara Šćekić."],
  ["Da li sajt može da se nađe na Google-u?", "Da, svaki sajt pravimo tehnički spreman za Google. Pozicije na Google-u ne može garantovati niko, ali dobra osnova i kvalitetan sadržaj su preduslov."],
  ["Šta je potrebno od mene?", "Kratak opis posla, logo i fotografije ako ih imate. Ako nemate tekstove ili fotografije, pomažemo i oko toga."],
];

const faqHtml = `<div class="faq">
        ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n        ")}
      </div>`;

const pages = [];

pages.push({
  path: "/services",
  title: "Usluge: web dizajn, izrada sajtova i web shopa | WebEra",
  description: "WebEra radi web dizajn, izradu web sajtova i online prodavnica za firme iz Crne Gore, Srbije i BiH. Pogledajte usluge, proces rada i radove.",
  crumbs: [["/services", "Usluge"]],
  body: [
    hero("Usluge", "Web dizajn i izrada web sajtova", "Pravimo sajtove koji ne stare i koji prodaju: od prvog razgovora do objave na vašem domenu. Radimo za firme iz Podgorice, cijele Crne Gore i regiona."),
    block("Šta radimo", serviceLinks),
    block("Kako radimo", PROCESS),
    block("Radovi", `<p>Pogledajte <a href="/work">sajtove koje smo napravili</a>, od online prodavnica do sajtova za servise i zanatlije.</p>`),
    block("Česta pitanja", faqHtml),
  ].join("\n"),
  schema: [{ "@context": "https://schema.org", "@type": "Service", serviceType: "Web dizajn i izrada web sajtova", provider: { "@id": `${SITE}/#webera` }, areaServed: ORG.areaServed }],
});

pages.push({
  path: "/web-design",
  title: "Web dizajn Podgorica i Crna Gora | WebEra",
  description: "Web dizajn za firme iz Podgorice i cijele Crne Gore: moderan, prepoznatljiv dizajn sajta koji vodi posjetioca do poziva ili kupovine.",
  crumbs: [["/services", "Usluge"], ["/web-design", "Web dizajn"]],
  body: [
    hero("Web dizajn · web design Montenegro", "Web dizajn u Podgorici i Crnoj Gori", "Dizajn sajta je prvo što kupac vidi o vašoj firmi. Pravimo ga tako da izgleda kao vaš brend, da se lako koristi na telefonu i da ne zastari za godinu dana."),
    block("Kome je namijenjeno", list([
      "Firmama koje nemaju sajt ili imaju zastario sajt",
      "Radnjama, servisima i zanatlijama koji žele više upita i poziva",
      "Brendovima kojima treba sajt koji izgleda premium",
    ])),
    block("Šta dobijate", list([
      "Dizajn početne i svih stranica, prilagođen telefonu, tabletu i računaru",
      "Jasan raspored: šta radite, zašto vi, radovi i kontakt",
      "Dugmad za poziv, WhatsApp i upit na pravim mjestima",
      "Animacije i 3D efekte kada imaju smisla za vaš brend",
    ])),
    block("Kako radimo", PROCESS),
    block("Primjeri", grid(PROJECTS.filter((p) => ["montana", "vrata-radulovic", "cvjecara-scekic"].includes(p.slug)))),
    block("Dalje", `<p>Dizajn pretvaramo u gotov sajt: pogledajte <a href="/web-development">izradu web sajtova</a> ili <a href="/ecommerce">izradu web shopa</a>.</p>`),
  ].join("\n"),
  schema: [{ "@context": "https://schema.org", "@type": "Service", serviceType: "Web dizajn", provider: { "@id": `${SITE}/#webera` }, areaServed: ORG.areaServed }],
});

pages.push({
  path: "/web-development",
  title: "Izrada web sajtova Crna Gora i Podgorica | WebEra",
  description: "Izrada web sajtova po mjeri u Crnoj Gori: brzi, moderni sajtovi spremni za Google, od prezentacije firme do sajtova sa 3D animacijama.",
  crumbs: [["/services", "Usluge"], ["/web-development", "Izrada web sajtova"]],
  body: [
    hero("Izrada sajtova · website development Montenegro", "Izrada web sajtova po mjeri", "Pravimo sajtove za firme iz Crne Gore, Srbije i BiH. Svaki sajt pišemo za konkretan posao, a ne iz gotove šablone."),
    block("Šta dobijate", list([
      "Brz sajt, optimizovan za telefon",
      "Ispravne naslove i opise za Google, mapu sajta i prijavu u Google Search Console",
      "Sopstveni domen i objavu sajta",
      "Kontakt preko poziva, WhatsApp-a i emaila",
      "Po želji: više jezika, animacije i 3D scene",
    ])),
    block("Vrste sajtova", list([
      "Prezentacioni sajt firme",
      "Sajt za servis ili zanatsku radnju sa upitom za ponudu",
      "Portfolio i brend sajtovi sa animacijama",
      `Online prodavnica, više na stranici <a href="/ecommerce">izrada web shopa</a>`,
    ])),
    block("Kako radimo", PROCESS),
    block("Primjeri", grid(PROJECTS.filter((p) => ["powerm-max", "psc-knezevic", "hp-line"].includes(p.slug)))),
  ].join("\n"),
  schema: [{ "@context": "https://schema.org", "@type": "Service", serviceType: "Izrada web sajtova", provider: { "@id": `${SITE}/#webera` }, areaServed: ORG.areaServed }],
});

pages.push({
  path: "/ecommerce",
  title: "Izrada web shopa i online prodavnice | WebEra",
  description: "Izrada web shopa za firme iz Crne Gore i regiona: katalog, filteri, korpa i plaćanje karticom. Primjeri: Montana Shop i Cvjećara Šćekić.",
  crumbs: [["/services", "Usluge"], ["/ecommerce", "Izrada web shopa"]],
  body: [
    hero("Web shop · ecommerce web design", "Izrada web shopa i online prodavnice", "Online prodavnica koja radi i kad je radnja zatvorena. Pravimo katalog, korpu i plaćanje karticom, prilagođeno kupcima iz Crne Gore i regiona."),
    block("Šta dobijate", list([
      "Katalog proizvoda sa kategorijama, veličinama, bojama i filterima",
      "Pretragu proizvoda",
      "Korpu i naručivanje",
      "Plaćanje platnim karticama, po dogovoru sa vašom bankom ili procesorom",
      "Fotografije i opise proizvoda spremne za Google",
    ])),
    block("Primjeri", grid(PROJECTS.filter((p) => ["montana", "cvjecara-scekic"].includes(p.slug)))),
    block("Kako radimo", PROCESS),
  ].join("\n"),
  schema: [{ "@context": "https://schema.org", "@type": "Service", serviceType: "Izrada web shopa", provider: { "@id": `${SITE}/#webera` }, areaServed: ORG.areaServed }],
});

pages.push({
  path: "/work",
  title: "Radovi: sajtovi i web shopovi koje smo napravili | WebEra",
  description: "Portfolio WebEra: online prodavnice, sajtovi za servise, zanatlije i brendove iz Crne Gore. Montana Shop, Cvjećara Šćekić, PowerM Max i drugi.",
  crumbs: [["/work", "Radovi"]],
  body: [
    hero("Radovi", "Sajtovi koje smo napravili", "Svaki projekat je priča za sebe. Ovo su sajtovi koje smo radili za firme iz Crne Gore."),
    `      <section class="block">
        ${grid(PROJECTS)}
      </section>`,
    block("Vaš projekat", `<p>Treba vam sajt ili web shop? Pogledajte <a href="/services">usluge</a> ili nam se javite.</p>`),
  ].join("\n"),
});

for (const p of PROJECTS.filter((p) => p.study)) {
  const s = STUDIES[p.slug];
  pages.push({
    path: `/work/${p.slug}`,
    title: `${p.title}: ${p.cat.toLowerCase()} | Studija slučaja | WebEra`,
    description: `${s.lead} Pogledajte šta je WebEra napravio za ${p.title}.`,
    crumbs: [["/work", "Radovi"], [`/work/${p.slug}`, p.title]],
    body: [
      hero(`Studija slučaja · ${p.cat}`, esc(p.title), esc(s.lead)),
      `      <figure class="cover"><img src="${p.img}" alt="${esc(p.alt)}" width="1600" height="866" fetchpriority="high" /></figure>`,
      block("Klijent", `<p>${esc(s.client)}</p>`),
      block("Izazov", `<p>${esc(s.challenge)}</p>`),
      block("Cilj", `<p>${esc(s.goal)}</p>`),
      block("Pristup i dizajn", list(s.approach.map(esc))),
      block("Šta smo napravili", list(s.built.map(esc))),
      ...(s.tech ? [block("Tehnologije", `<p>${esc(s.tech)}</p>`)] : []),
      block("Rezultat", `<p>${esc(s.result)}</p>`),
      block("Pogledajte uživo", `<p><a class="btn line" href="${p.url}" target="_blank" rel="noopener">Posjeti ${esc(p.title)} ↗</a></p><p>Pogledajte i <a href="/work">ostale radove</a>, <a href="/services">naše usluge</a> ili <a href="/contact">zatražite ponudu za svoj sajt</a>.</p>`),
    ].join("\n"),
  });
}

pages.push({
  path: "/about",
  title: "O nama: WebEra, web dizajn studio iz Podgorice | WebEra",
  description: "WebEra je web dizajn studio iz Podgorice. Pravimo sajtove koji traju, koji inspirišu i koji daju rezultat, za firme iz Crne Gore i regiona.",
  crumbs: [["/about", "O nama"]],
  body: [
    hero("O nama", "Dizajn van vremena", "WebEra je web dizajn studio iz Podgorice. Iza njega stoji Ilijas Dobardžić, web dizajner i developer."),
    block("Šta nas vodi", `<p>Trendovi prolaze, dobar dizajn ostaje. Radimo na tome da pravimo web sajtove koji traju, koji inspirišu i koji daju rezultat, i to tačno po željama klijenata.</p>
        <p>Nismo dugo u igri, ali vrijeme je na našoj strani. Svaki projekat je priča za sebe i trudimo se da je ispričamo najbolje što možemo, spajajući moderne web tehnologije i čistu estetiku.</p>`),
    block("Zašto naš dizajn traje", list([
      "<strong>Brzina i optimizacija.</strong> Sajtovi koji se brzo učitavaju, sa čistim kodom.",
      "<strong>Fokus na konverzije.</strong> Dizajn koji vodi posjetioca do poziva ili kupovine.",
      "<strong>Sigurnost i stabilnost.</strong> Moderne tehnologije za dugoročnu stabilnost.",
      "<strong>Dizajn van vremena.</strong> Estetika koja ne juri kratkotrajne trendove.",
    ])),
    block("Gdje radimo", `<p>Sjedište je u Podgorici, a radimo sa firmama iz cijele Crne Gore, Srbije i Bosne i Hercegovine.</p><p><a href="/work">Pogledajte naše radove</a> · <a href="/services">Usluge</a></p>`),
  ].join("\n"),
});

pages.push({
  path: "/contact",
  title: "Kontakt: zatražite ponudu za sajt | WebEra",
  description: "Kontaktirajte WebEra za izradu sajta ili web shopa. Pišite na WhatsApp ili email i dobićete ponudu. Odgovori na česta pitanja o cijeni i roku.",
  crumbs: [["/contact", "Kontakt"]],
  body: [
    hero("Kontakt", "Spremni za saradnju?", "Pošaljite kratak opis vaše firme i šta vam treba. Javljamo se sa pitanjima i ponudom."),
    block("Kontakt", `<ul class="contact-list">
          <li><span class="label">WhatsApp</span><a href="${WHATSAPP}" target="_blank" rel="noopener">${PHONE_PRETTY}</a></li>
          <li><span class="label">Email</span><a href="mailto:${EMAIL}">${EMAIL}</a></li>
          <li><span class="label">Instagram</span><a href="${INSTAGRAM}" target="_blank" rel="noopener">@webera_design</a></li>
          <li><span class="label">Lokacija</span><span>Podgorica, Crna Gora · radimo za cijeli region</span></li>
        </ul>`),
    block("Česta pitanja", faqHtml, "faq"),
  ].join("\n"),
});

/* ------------------------------------------------------------------ */

for (const p of pages) {
  const file = join(OUT, `${p.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(p));
}

const urls = ["/", ...pages.map((p) => p.path)];
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`,
);
writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Napravljeno ${pages.length} stranica, sitemap sa ${urls.length} adresa.`);
