"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// ── Animation constants ────────────────────────────────────────────────────
const TEXTS      = ["MEDITATIONS ON RUINS", "RUINS.LTD"] as const;
const HOLD       = 2.4;   // seconds to hold each word sharp
const OUT_DUR    = 0.65;  // seconds to blur out
const IN_DUR     = 0.65;  // seconds to blur in
const MAX_BLUR   = 80;    // peak horizontal blur in px

// On-twos: 12 unique frames per second (every 2 frames at 24fps ≈ 83ms)
const TWOS_MS    = 1000 / 12;

export default function MotionBlurText() {
  const elRef       = useRef<HTMLDivElement>(null);
  const blurNodeRef = useRef<SVGFEGaussianBlurElement>(null);
  const currentRef  = useRef(0);

  useEffect(() => {
    const el       = elRef.current;
    const blurNode = blurNodeRef.current;
    if (!el || !blurNode) return;

    // ── Helpers ──────────────────────────────────────────────────────────────
    const proxy = { blur: 0 };

    function applyBlur(v: number) {
      blurNode.setAttribute("stdDeviation", `${v} 0`);
      el!.style.filter = v > 0.2 ? "url(#hblur)" : "none";
    }

    // On-twos quantiser — snaps continuous GSAP values to 12fps steps
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

    // ── Transition cycle ─────────────────────────────────────────────────────
    function transition() {
      const next = (currentRef.current + 1) % TEXTS.length;

      gsap.timeline({
        onComplete: () => {
          currentRef.current = next;
          gsap.delayedCall(HOLD, transition);
        },
      })
        // 1. Blur out — stuttered on twos
        .to(proxy, {
          blur: MAX_BLUR,
          duration: OUT_DUR,
          ease: "power2.in",
          onUpdate: () => applyBlurOnTwos(proxy.blur),
        })
        // 2. Swap text at peak blur
        .call(() => {
          el!.textContent = TEXTS[next];
        })
        // 3. Blur in — stuttered on twos
        .to(proxy, {
          blur: 0,
          duration: IN_DUR,
          ease: "power2.out",
          onUpdate: () => applyBlurOnTwos(proxy.blur),
        });
    }

    // ── Initial reveal — smooth (no stutter on load) ─────────────────────────
    el.textContent = TEXTS[0];
    proxy.blur     = MAX_BLUR;
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

    // Cleanup on unmount
    return () => {
      gsap.killTweensOf(proxy);
    };
  }, []);

  return (
    <>
      {/* Live horizontal-only SVG blur filter */}
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

      {/*
        Text element.
        Font size: clamp scales proportionally across all viewports.
        17pt at ~1440px wide ≈ 1.18vw. We express in vw so it's always
        relative to the viewport, with sensible min/max bounds.
        letter-spacing: 0.4em ≈ 400 tracking in design tools.
      */}
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
          // Shift left by half letter-spacing so text is optically centred
          // (letter-spacing adds space after the last character)
          paddingRight: "0.4em",
        }}
      />
    </>
  );
}
