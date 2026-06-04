"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function SpinningLogo() {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    let raf: number;
    let angle = 0;
    let paused = false;
    let pauseTimeout: ReturnType<typeof setTimeout>;

    const spin = () => {
      if (!paused) {
        angle += 0.4;
        const rad = (angle * Math.PI) / 180;
        const scaleX = Math.cos(rad);
        const opacity = 0.4 + 0.6 * Math.abs(Math.cos(rad));
        el.style.transform = `scaleX(${scaleX})`;
        el.style.opacity = String(opacity);
      }
      raf = requestAnimationFrame(spin);
    };

    const onEnter = () => {
      paused = true;
      clearTimeout(pauseTimeout);
      el.style.transition = "transform 0.4s ease, opacity 0.4s ease";
      el.style.transform = "scaleX(1)";
      el.style.opacity = "1";
    };

    const onLeave = () => {
      pauseTimeout = setTimeout(() => {
        el.style.transition = "";
        paused = false;
      }, 600);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(spin);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(pauseTimeout);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={logoRef}
      style={{
        transformOrigin: "center center",
        willChange: "transform, opacity",
        display: "inline-block",
      }}
    >
      <Image
        src="/ruins-logo.svg"
        alt="Ruins Ltd"
        width={320}
        height={97}
        priority
        style={{ display: "block", filter: "invert(1)" }}
      />
    </div>
  );
}
