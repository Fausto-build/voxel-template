import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { Vector3Tuple } from "../types/world.types";

type MissionMarkerProps = {
  position: Vector3Tuple;
  visible: boolean;
};

export function MissionMarker({ position, visible }: MissionMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + 0.08 + Math.sin(state.clock.elapsedTime * 3) * 0.04;
  });

  if (!visible) {
    return null;
  }

  return (
    <group ref={groupRef} position={[position[0], position[1] + 0.08, position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.05, 8, 36]} />
        <meshStandardMaterial color="#FFD84D" emissive="#FFD84D" emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#FFD84D" emissive="#FFD84D" emissiveIntensity={0.6} flatShading />
      </mesh>
    </group>
  );
}
