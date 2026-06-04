"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

const RA_URL = "https://ra.co/pre/2460561";

function PosterMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, "/poster.webp");
  const [hovered, setHovered] = useState(false);

  const drag = useRef({ active: false, lastX: 0, lastY: 0 });
  const clickStart = useRef<{ x: number; y: number } | null>(null);
  const rot = useRef({ x: 0, y: 0, z: 0 });
  const vel = useRef({ x: 0, y: 0 });
  // When not dragging, lerp toward the idle sine target
  const idleMode = useRef(true);

  const POSTER_W = 2.2;
  const POSTER_H = POSTER_W * (1123 / 794);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    if (drag.current.active) {
      idleMode.current = false;
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;
    } else {
      // Decay velocity after release
      vel.current.x *= 0.92;
      vel.current.y *= 0.92;
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;

      // Once momentum dies down, blend back to idle sine wave
      const speed = Math.abs(vel.current.x) + Math.abs(vel.current.y);
      if (speed < 0.001) idleMode.current = true;

      if (idleMode.current) {
        const targetX = Math.sin(t * 0.31) * 0.18;
        const targetY = Math.sin(t * 0.19) * 0.22;
        const targetZ = Math.sin(t * 0.13) * 0.06;
        rot.current.x += (targetX - rot.current.x) * 0.03;
        rot.current.y += (targetY - rot.current.y) * 0.03;
        rot.current.z += (targetZ - rot.current.z) * 0.03;
      }
    }

    meshRef.current.rotation.x = rot.current.x;
    meshRef.current.rotation.y = rot.current.y;
    meshRef.current.rotation.z = rot.current.z;

    const targetScale = hovered && !drag.current.active ? 1.04 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 6
    );
  });

  const getXY = (e: PointerEvent | TouchEvent) => {
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as PointerEvent).clientX, y: (e as PointerEvent).clientY };
  };

  const onPointerDown = useCallback((e: any) => {
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    drag.current = { active: true, lastX: clientX, lastY: clientY };
    clickStart.current = { x: clientX, y: clientY };
    vel.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent | TouchEvent) => {
      if (!drag.current.active) return;
      const { x, y } = getXY(e);
      const dx = x - drag.current.lastX;
      const dy = y - drag.current.lastY;
      vel.current.y = dx * 0.01;
      vel.current.x = dy * 0.01;
      rot.current.y += dx * 0.01;
      rot.current.x += dy * 0.01;
      drag.current.lastX = x;
      drag.current.lastY = y;
    };

    const onUp = (e: PointerEvent | TouchEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;

      if (clickStart.current) {
        const { x, y } = getXY(e);
        const dx = Math.abs(x - clickStart.current.x);
        const dy = Math.abs(y - clickStart.current.y);
        if (dx < 8 && dy < 8) {
          window.open(RA_URL, "_blank", "noopener,noreferrer");
        }
        clickStart.current = null;
      }
    };

    window.addEventListener("pointermove", onMove as any);
    window.addEventListener("pointerup", onUp as any);
    window.addEventListener("touchmove", onMove as any, { passive: true });
    window.addEventListener("touchend", onUp as any);
    return () => {
      window.removeEventListener("pointermove", onMove as any);
      window.removeEventListener("pointerup", onUp as any);
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("touchend", onUp as any);
    };
  }, []);

  return (
    <mesh
      ref={meshRef}
      onPointerDown={onPointerDown}
      onPointerEnter={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[POSTER_W, POSTER_H]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function EventCard() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onDown = () => setIsDragging(true);
    const onUp = () => setIsDragging(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 4, 5]} intensity={0.6} />
        <PosterMesh />
      </Canvas>
    </div>
  );
}
