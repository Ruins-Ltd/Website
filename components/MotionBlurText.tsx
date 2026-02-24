"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const TEXTS: string[]  = ["MEDITATIONS ON RUINS", "RUINS.LTD"];
const HOLD     = 2.4;
const OUT_DUR  = 0.65;
const IN_DUR   = 0.65;
const TWOS_MS  = 1000 / 12;

// Ghost layers — each is the same text, stretched and faded
// to simulate a horizontal motion smear
const GHOSTS = [
  { scaleX: 1.04, opacity: 0.5 },
  { scaleX: 1.12, opacity: 0.3 },
  { scaleX: 1.28, opacity: 0.18 },
  { scaleX: 1.55, opacity: 0.10 },
  { scaleX: 1.90, opacity: 0.05 },
];

export default function MotionBlurText() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const mainRef    = useRef<HTMLDivElement>(null);
  const ghostRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const currentRef = useRef<number>(0);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const main   = mainRef.current;
    const ghosts = ghostRefs.current;
    if (!wrap || !main) return;

    // proxy: 0 = sharp, 1 = full smear
    const proxy = { t: 0 };

    let lastSnap = 0;
    let snappedT = 0;

    function applySmear(t: number) {
  if (main) main.style.opacity = String(1 - t * 0.85);
      ghosts.forEach((g, i) => {
        if (!g) return;
        const def = GHOSTS[i];
        if (!def) return;
        const scaleX = 1 + (def.scaleX - 1) * t;
        g.style.transform = `translateX(-50%) scaleX(${scaleX})`;
        g.style.opacity   = String(def.opacity * t);
      });
    }

    function applySmearOnTwos(raw: number) {
      const now = performance.now();
      if (now - lastSnap >= TWOS_MS) {
        snappedT = raw;
        lastSnap = now;
      }
      applySmear(snappedT);
    }

    function setAllText(txt: string) {
      main.textContent = txt;
      ghosts.forEach(g => { if (g) g.textContent = txt; });
    }

    function transition() {
      const next = (currentRef.current + 1) % TEXTS.length;

      gsap.timeline({
        onComplete: () => {
          currentRef.current = next;
          gsap.delayedCall(HOLD, transition);
        },
      })
        .to(proxy, {
          t: 1,
          duration: OUT_DUR,
          ease: "power2.in",
          onUpdate: () => applySmearOnTwos(proxy.t),
        })
        .call(() => {
          setAllText(TEXTS[next] ?? "");
        })
        .to(proxy, {
          t: 0,
          duration: IN_DUR,
          ease: "power2.out",
          onUpdate: () => applySmearOnTwos(proxy.t),
        });
    }

    // Initial reveal — smooth, no stutter on load
    setAllText(TEXTS[0] ?? "");
    applySmear(1);
    wrap.style.opacity = "1";

    gsap.to(proxy, {
      t: 0,
      duration: 1.4,
      ease: "power3.out",
      delay: 0.4,
      onUpdate: () => applySmear(proxy.t),
      onComplete: () => { gsap.delayedCall(HOLD, transition); },
    });

    return () => {
      gsap.killTweensOf(proxy);
    };
  }, []);

  const textStyle: React.CSSProperties = {
    fontFamily:    "var(--font-public-sans), sans-serif",
    fontWeight:    400,
    fontSize:      "clamp(10px, 1.7vw, 26px)",
    letterSpacing: "0.4em",
    color:         "oklch(98.6% 0.002 67.8)",
    textTransform: "uppercase",
    whiteSpace:    "nowrap",
    paddingRight:  "0.4em",
    willChange:    "transform, opacity",
    userSelect:    "none",
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", opacity: 0 }}
      aria-label="Meditations on Ruins"
    >
      {/* Ghost smear layers — rendered behind main */}
      {GHOSTS.map((_, i) => (
        <div
          key={i}
          ref={el => { ghostRefs.current[i] = el; }}
          aria-hidden="true"
          style={{
            ...textStyle,
            position:        "absolute",
            left:            "50%",
            top:             "50%",
            transform:       "translateX(-50%) scaleX(1)",
            transformOrigin: "center center",
            translate:       "0 -50%",
            opacity:         0,
          }}
        />
      ))}

      {/* Main sharp text layer */}
      <div
        ref={mainRef}
        style={{ ...textStyle, position: "relative" }}
      />
    </div>
  );
}
