import { useEffect, useRef } from "react";
import Hls from "hls.js";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";

const socialLinks = ["Twitter", "LinkedIn", "Dribbble", "GitHub"];

export function Footer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

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
    // Marquee Animation
    if (!marqueeRef.current) return;
    
    gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: "none",
      repeat: -1,
    });
  }, []);

  return (
    <footer id="contact" className="relative pt-16 md:pt-20 pb-8 md:pb-12 overflow-hidden bg-bg">
      {/* Background Video (Flipped vertically) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 scale-y-[-1]"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-bg to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[50vh]">
        
        {/* Marquee */}
        <div className="w-full overflow-hidden whitespace-nowrap mb-12 select-none flex">
          <div ref={marqueeRef} className="inline-flex flex-nowrap items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="text-[120px] md:text-[200px] lg:text-[240px] font-display italic text-text-primary/10 tracking-tight pr-8 leading-none">
                BUILDING THE FUTURE &bull;
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center px-6">
          <h2 className="text-4xl md:text-6xl text-text-primary mb-8">
            Ready to <span className="font-display italic">collaborate?</span>
          </h2>
          
          <a href="mailto:hello@michaelsmith.com" className="inline-flex group relative rounded-full text-sm px-8 py-4 hover:scale-105 transition-all bg-text-primary text-bg hover:bg-bg hover:text-text-primary border border-transparent hover:border-transparent items-center gap-2 font-medium">
            <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(90deg,#89AACC_0%,#4E85BF_100%)] opacity-0 group-hover:opacity-100 transition-opacity -z-10 animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-0 rounded-full group-hover:bg-bg transition-colors -z-10" />
            hello@michaelsmith.com <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Footer Bar */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 mt-20 pt-8 border-t border-stroke/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            <div className="relative rounded-full w-2 h-2 bg-green-500" />
          </div>
          <span className="text-sm text-muted">Available for projects</span>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6">
          {socialLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted hover:text-text-primary transition-colors">
              {link}
            </a>
          ))}
        </div>
        
        <div className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Michael Smith
        </div>
      </div>
    </footer>
  );
}
