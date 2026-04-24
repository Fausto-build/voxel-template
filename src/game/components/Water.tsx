import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { WATER_LEVEL } from "../core/constants";

type WaterProps = {
  color: string;
};

export function Water({ color }: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.position.y = WATER_LEVEL + Math.sin(state.clock.elapsedTime * 0.7) * 0.03;
  });

  return (
    <mesh ref={meshRef} position={[0, WATER_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <circleGeometry args={[96, 96]} />
      <meshStandardMaterial color={color} transparent opacity={0.62} roughness={0.25} depthWrite={false} />
    </mesh>
  );
}
