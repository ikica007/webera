import { useEffect, useRef } from "react";
import { START, TOTAL, clamp, clock, lerp, loadState, local, pointer, ramp, reducedMotion, subscribe } from "../lib/engine";
import { loadPack } from "../lib/frames";
import { PANEL_ASPECT, createStage, viewSize, type Color, type PanelPose, type RingPose } from "../lib/stage";
import { projects, trackAt, worksView } from "../lib/works";

/**
 * Pozadina sajta: film koji se premotava skrolom, čestice, stakleni žiroskop
 * i spirala panela sa radovima. Film je paket kadrova u public/assets
 * (vidi src/lib/frames.ts). Da zamijeniš film, zamijeni fajlove istim imenima.
 */
const PACK_DESKTOP = "/assets/epohe-desktop.bin";
const PACK_MOBILE = "/assets/epohe-mobile.bin";
const POSTER = "/assets/vrijeme-pocetak.jpg";

/**
 * Raspored filma po skrolu. Lijevo: tačka na skrolu (u visinama ekrana),
 * desno: sekunda filma koja se tada vidi. Film traje 29 s i ima tri klipa:
 * sat → antika (0–7 s), antika → budućnost (7–14 s), budućnost → horizont (14–29 s).
 * Pomjeri brojeve da neki prizor dođe ranije ili kasnije.
 */
const FILM_SECONDS = 29.125;
const CUES: [number, number][] = [
  [0, 0],
  [1.1, 1.5], // sat, prije nego što se otvori prolaz
  [1.75, 4.8], // prošli smo u antičku dvoranu
  [2.6, 8.25],
  [3.75, 11.3], // linija svjetlosti raste
  [4.15, 12.75], // bljesak, ulaz u budućnost
  [4.6, 14.4],
  [10.0, 23.6], // kraj radova, hodnik ekrana ostaje iza
  [10.7, 25.6], // prolaz kroz svjetlost
  [11.3, 26.6], // horizont
  [TOTAL, FILM_SECONDS],
];

/** Dio filma (0–1) za tačku na skrolu. */
function filmAt(u: number) {
  for (let i = 1; i < CUES.length; i++) {
    if (u <= CUES[i][0]) {
      const [u0, t0] = CUES[i - 1];
      const [u1, t1] = CUES[i];
      return (t0 + ((u - u0) / (u1 - u0)) * (t1 - t0)) / FILM_SECONDS;
    }
  }
  return 1;
}

type World = { particles: [Color, Color, Color]; glow: [Color, Color] };

/** Boje epoha: tri boje čestica i dva odsjaja u uglovima ekrana. */
const CLOCK: World = {
  particles: [[0.81, 0.89, 1], [0.54, 0.67, 0.8], [1, 0.85, 0.63]],
  glow: [[0.02, 0.09, 0.11], [0.03, 0.04, 0.1]],
};
const ANTIQUE: World = {
  particles: [[1, 0.77, 0.42], [1, 0.6, 0.24], [0.87, 0.92, 1]],
  glow: [[0.13, 0.075, 0.02], [0.02, 0.06, 0.08]],
};
const FUTURE: World = {
  particles: [[1, 0.37, 0.82], [0.56, 0.48, 1], [0.29, 0.89, 0.84]],
  glow: [[0.03, 0.14, 0.15], [0.1, 0.04, 0.17]],
};
const BEYOND: World = {
  particles: [[0.86, 0.92, 1], [0.54, 0.67, 0.8], [0.79, 0.72, 1]],
  glow: [[0.03, 0.06, 0.11], [0.02, 0.03, 0.07]],
};
/** Kada koja epoha vlada (u visinama ekrana). */
const ERAS: [number, World][] = [
  [0, CLOCK],
  [1.2, CLOCK],
  [1.65, ANTIQUE],
  [3.7, ANTIQUE],
  [4.1, FUTURE],
  [10.2, FUTURE],
  [10.9, BEYOND],
  [TOTAL, BEYOND],
];

const mixColor = (a: Color, b: Color, k: number, out: Color) => {
  out[0] = lerp(a[0], b[0], k);
  out[1] = lerp(a[1], b[1], k);
  out[2] = lerp(a[2], b[2], k);
};

/** Ugao između susjednih panela na spirali. */
const STEP = 1.02;

export function Backdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = createStage(canvas);
    if (!stage) {
      // Bez WebGL-a ostaje početna slika kao pozadina.
      canvas.style.display = "none";
      loadState.progress = 1;
      loadState.ready = true;
      return;
    }

    let alive = true;
    const portrait = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
    const pack = loadPack(portrait ? PACK_MOBILE : PACK_DESKTOP);
    stage.setPack(pack);

    let posterDone = false;
    const poster = new Image();
    poster.onload = () => {
      posterDone = true;
      if (alive) stage.setPoster(poster);
    };
    poster.onerror = () => {
      posterDone = true;
    };
    poster.src = POSTER;

    // slike radova tek kad se film pokrene, da ne usporavaju prvo učitavanje
    let worksRequested = false;
    const loadWorks = () => {
      if (worksRequested) return;
      worksRequested = true;
      projects.forEach((project, index) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (alive) stage.setWork(index, image);
        };
        image.src = project.src;
      });
    };

    const began = performance.now();
    const poses: PanelPose[] = projects.map((_, index) => ({
      index,
      x: 0,
      y: 0,
      z: -60,
      ry: 0,
      rx: 0,
      width: 1,
      alpha: 0,
      frost: 0,
      focus: 0,
    }));
    const outer: RingPose = { x: 0, y: 0, z: -5, rx: 0, ry: 0, radius: 1, tube: 0.03, alpha: 1, ticks: 60 };
    const inner: RingPose = { ...outer, ticks: 0 };
    const palette: [Color, Color, Color] = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
    const glow: [Color, Color] = [[0, 0, 0], [0, 0, 0]];
    let speed = 0;
    // trag miša: kružni niz tačaka koje blijede
    const trail = new Float32Array(36);
    let head = 0;
    let lastX = -1;
    let lastY = -1;

    const unsubscribe = subscribe((frame) => {
      if (!loadState.ready) {
        const waited = performance.now() - began;
        const enough = pack.count > 0 && pack.available >= Math.min(pack.count, 18) && !!pack.get(0);
        loadState.progress = pack.failed ? 1 : pack.progress;
        if ((posterDone || waited > 4000) && (enough || pack.failed || waited > 9000)) {
          loadState.ready = true;
        }
      }
      // dok traje učitavanje, ekran je prekriven: ne crtamo, da telefon ne radi uzalud
      if (!loadState.ready) return;
      loadWorks();
      const u = clamp(frame.u, 0, TOTAL);
      const t = frame.t;
      const film = filmAt(u);
      if (pack.count) clock.duration = pack.duration;
      clock.time = film * clock.duration;

      for (let i = 0; i < 12; i++) trail[i * 3 + 2] *= Math.exp(-frame.dt * 2.6);
      if (pointer.active && !reducedMotion) {
        const x = pointer.px / window.innerWidth;
        const y = 1 - pointer.py / window.innerHeight;
        const moved = Math.hypot(x - lastX, y - lastY);
        if (moved > 0.012) {
          trail[head * 3] = x;
          trail[head * 3 + 1] = y;
          trail[head * 3 + 2] = Math.min(1, 0.35 + moved * 9);
          head = (head + 1) % 12;
          lastX = x;
          lastY = y;
        }
      }

      const target = clamp(Math.abs(frame.v) / 2.6);
      speed += (target - speed) * (1 - Math.exp(-frame.dt * 7));

      // boje epohe
      let era = 1;
      while (era < ERAS.length - 1 && u > ERAS[era][0]) era++;
      const k = ramp(ERAS[era - 1][0], ERAS[era][0], u);
      const from = ERAS[era - 1][1];
      const to = ERAS[era][1];
      for (let i = 0; i < 3; i++) mixColor(from.particles[i], to.particles[i], k, palette[i]);
      for (let i = 0; i < 2; i++) mixColor(from.glow[i], to.glow[i], k, glow[i]);

      const aspect = window.innerWidth / window.innerHeight;
      const view = viewSize(aspect);
      const narrow = aspect < 0.9;

      // Radovi: paneli stoje na spirali oko svjetlosne ose. Skrol okreće spiralu,
      // panel u fokusu je naprijed, susjedi vire sa strane kao mutno staklo.
      const w = local("work", u);
      const gate = ramp(-0.05, 0.02, w) * (1 - ramp(0.97, 1.03, w));
      const track = trackAt(w);
      const helix = narrow ? view.width * 0.62 : view.width * 0.47;
      const axisZ = view.z - helix;
      const focusY = narrow ? view.height * 0.14 : view.height * 0.07;
      const cardWidth = narrow
        ? view.width * 0.8
        : Math.min(view.width * 0.46, view.height * 0.6 * PANEL_ASPECT);
      let best: PanelPose | null = null;

      for (const pose of poses) {
        const d = track - pose.index;
        const away = Math.abs(d);
        pose.width = cardWidth;
        if (gate <= 0 || away > 2.9) {
          pose.alpha = 0;
          pose.focus = 0;
          continue;
        }
        const theta = -d * STEP;
        pose.focus = 1 - ramp(0.05, 0.55, away);
        pose.frost = ramp(0.1, 0.75, away);
        pose.x = Math.sin(theta) * helix - pointer.x * 0.06 * pose.focus;
        pose.z = axisZ + Math.cos(theta) * helix;
        pose.y = focusY + d * view.height * 0.34;
        // panel u fokusu se blago okreće za mišem i naginje sa brzinom skrola
        const sway = Math.sin(t * 0.6 + pose.index * 1.7) * 0.012;
        pose.ry = theta + (pointer.x * 0.12 + sway) * pose.focus;
        pose.rx = (pointer.y * 0.07 + clamp(frame.v * 0.02, -0.12, 0.12)) * pose.focus;
        pose.alpha = gate * (1 - ramp(1.9, 2.75, Math.abs(theta)));
        if (!best || pose.focus * pose.alpha > best.focus * best.alpha) best = pose;
      }

      if (best && best.focus > 0.55 && best.alpha > 0.6) {
        worksView.rect = stage.project(best);
        worksView.active = best.index;
      } else {
        worksView.rect = null;
      }

      // Stakleni žiroskop: na početku je uspravna linija (prsten gledan sa ivice),
      // otvara se u krug, kod radova postaje orbita oko ose,
      // a na kraju legne u liniju horizonta.
      const base = Math.min(view.height * 0.3, view.width * 0.36);
      const open = ramp(0.3, 1.5, u);
      const orbit =
        ramp(START.work - 0.45, START.work + 0.3, u) *
        (1 - ramp(START.principles - 0.45, START.principles + 0.1, u));
      const flat = ramp(START.principles - 0.25, START.principles + 0.6, u);
      const free = open * (1 - orbit) * (1 - flat);

      let radius = lerp(base * 0.62, base, open);
      radius = lerp(radius, helix * 0.66, orbit);
      radius = lerp(radius, base * 1.5, flat);
      // kad prstenovi legnu u horizont, stope se sa linijom iz filma
      const ringAlpha = 1 - ramp(START.principles + 0.5, START.principles + 1.0, u);
      const ringY = lerp(0, focusY - (cardWidth / PANEL_ASPECT) * 0.62, orbit);
      const ringZ = lerp(view.z, axisZ, orbit);

      outer.alpha = inner.alpha = ringAlpha;
      outer.radius = radius;
      outer.tube = base * 0.03;
      outer.y = ringY;
      outer.z = ringZ;
      outer.rx =
        lerp(lerp(0, 1.33, orbit), Math.PI / 2, flat) +
        (Math.sin(t * 0.4) * 0.07 + pointer.y * 0.1) * open * (1 - flat);
      outer.ry =
        (1 - open) * (Math.PI / 2) + (Math.sin(u * 1.25) * 0.38 + pointer.x * 0.16) * free;

      inner.radius = radius * 0.74;
      inner.tube = base * 0.022;
      inner.y = ringY;
      inner.z = ringZ;
      inner.rx =
        lerp(lerp(free * (0.55 + Math.sin(u * 0.8) * 0.4), 1.05, orbit), Math.PI / 2, flat) +
        pointer.y * 0.08 * open * (1 - flat);
      inner.ry =
        (1 - open) * (Math.PI / 2) +
        free * (u * 0.9 + t * 0.12) +
        orbit * (t * 0.1 - track * 0.5);

      stage.render({
        time: t,
        frame: film * Math.max(0, pack.count - 1),
        direction: frame.v >= 0 ? 1 : -1,
        speed: reducedMotion ? 0 : speed,
        mouseX: pointer.x,
        mouseY: pointer.y,
        // slika se blago zatamni iza teksta i radova, da se bolje čitaju
        dim: Math.max(0.2 * orbit, 0.3 * ramp(1.45, 1.8, u) * (1 - ramp(3.6, 3.95, u))),
        travel: u * 0.9 + t * 0.006,
        panels: poses,
        rings: [outer, inner],
        palette,
        glow,
        swarm: {
          spin: u * 0.4 - track * STEP * orbit,
          x: 0,
          y: lerp(0, focusY, orbit),
          z: lerp(view.z - 1.6, axisZ, orbit),
          radius: lerp(base * 2.4, helix * 1.25, orbit),
          height: view.height * 0.95,
          alpha: lerp(0.45 + 0.2 * open, 1, orbit) * (1 - flat * 0.45),
        },
        axisZ,
        trail,
      });
    });

    return () => {
      alive = false;
      unsubscribe();
      pack.dispose();
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="backdrop-canvas" />
    </div>
  );
}
