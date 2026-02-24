"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const TEXTS: string[] = ["MEDITATIONS ON RUINS", "RUINS.LTD"];
const HOLD     = 2.4;
const OUT_DUR  = 0.65;
const IN_DUR   = 0.65;
const MAX_BLUR = 80;
const TWOS_MS  = 1000 / 12;

export default function MotionBlurText() {
  const elRef       = useRef<HTMLDivElement>(null);
  const blurNodeRef = useRef<SVGFEGaussianBlurElement>(null);
  const currentRef  = useRef<number>(0);

  useEffect(() => {
    const el       = elRef.current;
    const blurNode = blurNodeRef.current;
    if (!el || !blurNode) return;

    const proxy = { blur: 0 };

    function applyBlur(v: number) {
      if (!blurNode) return;
      blurNode.setAttribute("stdDeviation", `${v} 0`);
      el!.style.filter = v > 0.2 ? "url(#hblur)" : "none";
    }

    let lastSnap    = 0;
    let snappedBlur = 0;

    function applyBlurOnTwos(rawBlur: number) {
      const now = performance.now();
      if (now - lastSnap >= TWOS_MS) {
        snappedBlur = rawBlur;
        lastSnap    = now;
      }
      applyBlur(snappedBlur);
    }

    function transition() {
      const next = (currentRef.current + 1) % TEXTS.length;
      gsap
        .timeline({
          onComplete: () => {
            currentRef.current = next;
            gsap.delayedCall(HOLD, transition);
          },
        })
        .to(proxy, {
          blur: MAX_BLUR,
          duration: OUT_DUR,
          ease: "power2.in",
          onUpdate: () => applyBlurOnTwos(proxy.blur),
        })
        .call(() => {
          el.textContent = TEXTS[next] ?? "";
        })
        .to(proxy, {
          blur: 0,
          duration: IN_DUR,
          ease: "power2.out",
          onUpdate: () => applyBlurOnTwos(proxy.blur),
        });
    }

    el.textContent   = TEXTS[0] ?? "";
    proxy.blur       = MAX_BLUR;
    applyBlur(proxy.blur);
    el.style.opacity = "1";

    gsap.to(proxy, {
      blur: 0,
      duration: 1.4,
      ease: "power3.out",
      delay: 0.4,
      onUpdate: () => applyBlur(proxy.blur),
      onComplete: () => gsap.delayedCall(HOLD, transition),
    });

    return () => {
      gsap.killTweensOf(proxy);
    };
  }, []);

  return (
    <>
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="hblur"
            x="-500%"
            width="1100%"
            y="-10%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur ref={blurNodeRef} stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      <div
        ref={elRef}
        aria-label="Meditations on Ruins"
        style={{
          fontFamily: "var(--font-public-sans), sans-serif",
          fontWeight: 400,
          fontSize: "clamp(10px, 1.7vw, 26px)",
          letterSpacing: "0.4em",
          color: "oklch(98.6% 0.002 67.8)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          opacity: 0,
          willChange: "filter, opacity",
          paddingRight: "0.4em",
        }}
      />
    </>
  );
}
