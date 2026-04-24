import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { useGameStore } from "../core/gameStore";
import type { CollectibleConfig } from "../types/world.types";

type CollectibleProps = {
  collectible: CollectibleConfig;
};

export function Collectible({ collectible }: CollectibleProps) {
  const collected = useGameStore((state) => state.collectedIds.includes(collectible.id));
  const groupRef = useRef<THREE.Group>(null);
  const color = collectible.color ?? "#39E6FF";

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += 0.03;
    groupRef.current.position.y =
      collectible.position[1] + Math.sin(state.clock.elapsedTime * 2.8 + collectible.position[0]) * 0.18;
  });

  if (collected) {
    return null;
  }

  return (
    <group ref={groupRef} position={collectible.position}>
      <mesh castShadow>
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
      <mesh position={[0, -0.68, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.78, 18]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}
