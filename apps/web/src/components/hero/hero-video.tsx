"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [allowMotion, setAllowMotion] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setAllowMotion(!motionQuery.matches);
    updateMotion();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();

    motionQuery.addEventListener("change", updateMotion);
    window.addEventListener("resize", handleResize);

    return () => {
      motionQuery.removeEventListener("change", updateMotion);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!allowMotion || isMobile || !videoRef.current) {
      if (videoRef.current) {
        videoRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      return;
    }

    const handleScroll = () => {
      const offset = window.scrollY || 0;
      const translate = Math.min(offset * 0.2, 80);
      videoRef.current!.style.transform = `translate3d(0, ${translate}px, 0)`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [allowMotion, isMobile]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        className="h-full w-full object-cover transition-transform duration-200 ease-out"
        autoPlay={allowMotion}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/hero-whisk.jpg"
      >
        <source src="/media/hero-whisk.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-charcoal-900/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/70 via-charcoal-900/40 to-charcoal-900" />
    </div>
  );
}
