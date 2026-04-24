import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useGameStore } from "../core/gameStore";
import type { CollectibleConfig } from "../types/world.types";

type CollectibleProps = {
  collectible: CollectibleConfig;
};

// Pooled burst: 24 particles per collectible, rendered as a Points mesh
const BURST_COUNT = 24;

function PickupBurst({ position, color }: { position: THREE.Vector3; color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);

  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(BURST_COUNT * 3);
    const vels: THREE.Vector3[] = [];

    for (let i = 0; i < BURST_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 1.2 + Math.random() * 2.8;
      vels.push(
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.cos(phi)) * speed + 0.8,
          Math.sin(phi) * Math.sin(theta) * speed,
        ),
      );
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, velocities: vels };
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size: 0.18,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
      }),
    [color],
  );

  useFrame((_, rawDelta) => {
    if (!pointsRef.current) return;
    const delta = Math.min(rawDelta, 0.033);
    progressRef.current = Math.min(progressRef.current + delta / 0.4, 1);

    const t = progressRef.current;
    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < BURST_COUNT; i++) {
      const vel = velocities[i];
      positions.setXYZ(
        i,
        vel.x * t * 0.6,
        vel.y * t * 0.6 - 4.9 * t * t * 0.25,
        vel.z * t * 0.6,
      );
    }

    positions.needsUpdate = true;
    material.opacity = 1 - t;
  });

  return (
    <points ref={pointsRef} position={position} geometry={geometry} material={material} />
  );
}

export function Collectible({ collectible }: CollectibleProps) {
  const collected = useGameStore((state) => state.collectedIds.includes(collectible.id));
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [showBurst, setShowBurst] = useState(false);
  const wasPreviouslyCollected = useRef(false);
  const color = collectible.color ?? "#39E6FF";

  const burstPosition = useMemo(
    () => new THREE.Vector3(...collectible.position),
    [collectible.position],
  );

  useEffect(() => {
    if (collected && !wasPreviouslyCollected.current) {
      wasPreviouslyCollected.current = true;
      setShowBurst(true);
      const timer = window.setTimeout(() => setShowBurst(false), 450);
      return () => window.clearTimeout(timer);
    }
  }, [collected]);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y += 0.03;
    groupRef.current.position.y =
      collectible.position[1] + Math.sin(state.clock.elapsedTime * 2.8 + collectible.position[0]) * 0.18;

    // Emissive pulse — sinusoidal intensity
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3.2) * 0.25;
    }
  });

  if (collected && !showBurst) {
    return null;
  }

  return (
    <>
      {showBurst && <PickupBurst position={burstPosition} color={color} />}
      {!collected && (
        <group ref={groupRef} position={collectible.position}>
          <mesh ref={meshRef} castShadow>
            <octahedronGeometry args={[0.62, 0]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.35}
              roughness={0.18}
              metalness={0.08}
              flatShading
            />
          </mesh>
          {/* Soft billboard halo */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 1.05, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.14} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.78, 18]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} />
          </mesh>
        </group>
      )}
    </>
  );
}
