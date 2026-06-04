"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

const RA_URL = "https://ra.co/pre/2460561";

function PosterMesh({ dragRef, clickStartRef }: {
  dragRef: React.MutableRefObject<{ active: boolean; lastX: number; lastY: number }>;
  clickStartRef: React.MutableRefObject<{ x: number; y: number } | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, "/poster.webp");
  const [hovered, setHovered] = useState(false);
  const rotation = useRef({ x: 0.1, y: 0.15 });
  const velocity = useRef({ x: 0, y: 0 });

  const POSTER_W = 2.2;
  const POSTER_H = POSTER_W * (1123 / 794);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (!dragRef.current.active) {
      if (hovered) {
        velocity.current.x *= 0.85;
        velocity.current.y *= 0.85;
        rotation.current.x += velocity.current.x;
        rotation.current.y += velocity.current.y;
      } else {
        const t = state.clock.elapsedTime;
        rotation.current.x = Math.sin(t * 0.31) * 0.18;
        rotation.current.y = Math.sin(t * 0.19) * 0.22;
        meshRef.current.rotation.z = Math.sin(t * 0.13) * 0.06;
      }
    } else {
      rotation.current.x += velocity.current.x;
      rotation.current.y += velocity.current.y;
    }

    meshRef.current.rotation.x = rotation.current.x;
    meshRef.current.rotation.y = rotation.current.y;

    const targetScale = hovered && !dragRef.current.active ? 1.04 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 6
    );
  });

  const onPointerDown = useCallback((e: any) => {
    e.stopPropagation();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragRef.current = { active: true, lastX: clientX, lastY: clientY };
    clickStartRef.current = { x: clientX, y: clientY };
  }, [dragRef, clickStartRef]);

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
  const drag = useRef({ active: false, lastX: 0, lastY: 0 });
  const clickStart = useRef<{ x: number; y: number } | null>(null);
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const getXY = (e: PointerEvent | TouchEvent) => {
      if ("touches" in e) {
        return { x: e.touches[0]?.clientX ?? 0, y: e.touches[0]?.clientY ?? 0 };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const onMove = (e: PointerEvent | TouchEvent) => {
      if (!drag.current.active) return;
      const { x, y } = getXY(e);
      const dx = x - drag.current.lastX;
      const dy = y - drag.current.lastY;
      velocity.current.y = dx * 0.01;
      velocity.current.x = dy * 0.01;
      drag.current.lastX = x;
      drag.current.lastY = y;
    };

    const onUp = (e: PointerEvent | TouchEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      setIsDragging(false);
      if (clickStart.current) {
        const { x, y } = getXY(e as PointerEvent);
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

  const onPointerDown = () => setIsDragging(true);

  return (
    <div
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 4, 5]} intensity={0.6} />
        <PosterMesh dragRef={drag} clickStartRef={clickStart} />
      </Canvas>
    </div>
  );
}
