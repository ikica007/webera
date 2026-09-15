import { useEffect, useRef } from "react";
import Hls from "hls.js";
import gsap from "gsap";
import { useLanguage } from "../context/LanguageContext";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Setup HLS Video
    const video = videoRef.current;
    if (!video) return;

    const videoSrc = "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

    if (Hls.isSupported()) {
      const hls = new Hls({
        startPosition: -1
      });
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    // GSAP Entrance
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      ".name-reveal",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2 },
      0.1
    ).fromTo(
      ".blur-in",
      { opacity: 0, filter: "blur(10px)", y: 20 },
      { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
      0.3
    );
  }, []);

  return (
    <section id="hero" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-20">
        <div className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-8">
          COLLECTION '26
        </div>
        
        <h1 className="name-reveal text-6xl md:text-8xl lg:text-9xl font-display italic leading-[0.9] tracking-tight text-text-primary mb-6 break-words px-4">
          {t('name')}
        </h1>
        
        <div className="blur-in text-base sm:text-lg md:text-2xl text-text-primary mb-4 font-light">
          <span className="font-display italic text-text-primary">{t('slogan')}</span>
        </div>
        
        <p className="blur-in text-sm md:text-base text-muted max-w-md mb-12">
          {t('heroDesc')}
        </p>
        
        <div className="blur-in flex flex-col sm:flex-row gap-4 items-center">
          <button className="group relative rounded-full text-sm px-7 py-3.5 hover:scale-105 transition-all bg-text-primary text-bg hover:bg-bg hover:text-text-primary border border-transparent hover:border-transparent">
            <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-0 group-hover:opacity-100 transition-opacity -z-10 animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-0 rounded-full group-hover:bg-bg transition-colors -z-10" />
            {t('seeWorks')}
          </button>
          
          <button className="group relative rounded-full text-sm px-7 py-3.5 hover:scale-105 transition-all border-2 border-stroke bg-bg text-text-primary hover:border-transparent">
            <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-0 group-hover:opacity-100 transition-opacity -z-10 animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-[2px] rounded-full group-hover:bg-bg transition-colors -z-10" />
            {t('reachOut')}
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs text-muted uppercase tracking-[0.2em]">{t('scroll')}</span>
        <div className="w-px h-10 bg-stroke relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-text-primary/50 animate-[scroll-down_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
