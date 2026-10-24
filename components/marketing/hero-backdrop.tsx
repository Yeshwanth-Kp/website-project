"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const POSTER = "/media/kumarakom-lake-resort-poster.jpg";
const VIDEO = "/media/kumarakom-lake-resort.mp4";

/**
 * Full-bleed backdrop for the landing hero. The poster doubles as the LCP
 * image and the reduced-motion fallback; the video fades in on top once it can
 * play. Playback pauses when the tab is hidden or the hero scrolls away.
 */
export function HeroBackdrop() {
  const reduceMotion = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const play = () => {
      void video.play().catch(() => {
        // Autoplay can be rejected (battery saver, data-saver). The poster stays.
      });
    };
    const markReady = () => setReady(true);

    if (video.readyState >= 2) markReady();
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);

    play();

    let inView = true;

    const onVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (inView) {
        play();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        inView = entry.isIntersecting;
        if (inView) {
          play();
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 },
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
      video.pause();
    };
  }, [reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-[#15100c]"
    >
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_45%]"
      />

      {!reduceMotion && (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full scale-[1.015] object-cover object-[50%_45%] transition-opacity duration-700 ease-out",
            ready ? "opacity-100" : "opacity-0",
          )}
          src={VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      )}

      {/* Legibility scrims: stronger and vertical on phones, directional on desktop. */}
      <div
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,11,8,0.82) 0%, rgba(15,11,8,0.64) 38%, rgba(15,11,8,0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(15,11,8,0.93) 0%, rgba(15,11,8,0.78) 32%, rgba(15,11,8,0.4) 60%, rgba(15,11,8,0.34) 100%)",
        }}
      />

      {/* Warm grade + vignette so the footage sits in the terracotta palette. */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(120% 95% at 68% 42%, transparent 38%, rgba(38,20,10,0.34) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,8,6,0.55) 0%, rgba(11,8,6,0.12) 55%, transparent 100%)",
        }}
      />

      {/* Melt the footage into the page background at the fold. */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.55) 55%, hsl(var(--background)) 100%)",
        }}
      />
    </div>
  );
}
