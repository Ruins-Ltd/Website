"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

const RA_URL = "https://ra.co/events/2460561";

function PosterMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, "/poster.webp");

  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const drag = useRef({ active: false, lastX: 0, lastY: 0 });
  const rotation = useRef({ x: 0.1, y: 0.15 });
  const velocity = useRef({ x: 0, y: 0 });
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const POSTER_W = 2.2;
  const POSTER_H = POSTER_W * (1123 / 794);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (!drag.current.active) {
      if (hovered) {
        velocity.current.x *= 0.88;
        velocity.current.y *= 0.88;
      } else {
        velocity.current.y += (0.15 - rotation.current.y) * 0.012;
        velocity.current.x += (0.1 - rotation.current.x) * 0.012;
        velocity.current.x *= 0.96;
        velocity.current.y += Math.sin(Date.now() * 0.0004) * 0.0004;
        velocity.current.y *= 0.96;
      }
      rotation.current.x += velocity.current.x;
      rotation.current.y += velocity.current.y;
    }

    meshRef.current.rotation.x = rotation.current.x;
    meshRef.current.rotation.y = rotation.current.y;

    const targetScale = hovered && !drag.current.active ? 1.04 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      delta * 6
    );
  });

  const onPointerDown = useCallback((e: any) => {
    e.stopPropagation();
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    clickStart.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  }, []);

  const onPointerMove = useCallback((e: any) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    velocity.current.y = dx * 0.01;
    velocity.current.x = dy * 0.01;
    rotation.current.y += dx * 0.01;
    rotation.current.x += dy * 0.01;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
  }, []);

  const onPointerUp = useCallback((e: any) => {
    drag.current.active = false;
    setDragging(false);
    if (clickStart.current) {
      const dx = Math.abs(e.clientX - clickStart.current.x);
      const dy = Math.abs(e.clientY - clickStart.current.y);
      if (dx < 4 && dy < 4) {
        window.open(RA_URL, "_blank", "noopener,noreferrer");
      }
      clickStart.current = null;
    }
  }, []);

  const mat = (
    <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
  );

  return (
    <mesh
      ref={meshRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[POSTER_W, POSTER_H]} />
      {mat}
    </mesh>
  );
}

export default function EventCard() {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
    >
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
