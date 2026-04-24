import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { Vector3Tuple } from "../types/world.types";

type WaypointRingProps = {
  position: Vector3Tuple;
  active: boolean;
  label?: string;
};

export function WaypointRing({ position, active }: WaypointRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const color = active ? "#4DE8FF" : "#4DE8FF44";
  const emissiveIntensity = active ? 0.7 : 0.2;

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    if (active) {
      ringRef.current.position.y = position[1] + 0.05 + Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
    }
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* ground ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[2.2, active ? 0.08 : 0.04, 8, 40]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={active ? 1 : 0.5}
        />
      </mesh>
      {/* vertical pillar for active waypoint */}
      {active && (
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 6, 6]} />
          <meshStandardMaterial color="#4DE8FF" emissive="#4DE8FF" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}
