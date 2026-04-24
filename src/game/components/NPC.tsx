import { Html } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import type { NPCConfig } from "../types/world.types";
import { useGameStore } from "../core/gameStore";

type NPCProps = {
  npc: NPCConfig;
};

export function NPC({ npc }: NPCProps) {
  const missionState = useGameStore((state) =>
    npc.missionId ? state.missionStates[npc.missionId] : null,
  );
  const rotation = npc.rotation ?? [0, 0, 0];
  const robeColor = npc.color ?? "#6D5DF6";
  const markerColor = missionState === "ready_to_complete" ? "#FFD84D" : "#FFFFFF";

  return (
    <RigidBody type="fixed" colliders={false} position={npc.position} rotation={rotation}>
      <group>
        <mesh castShadow position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.42, 0.7, 5, 8]} />
          <meshStandardMaterial color={robeColor} flatShading />
        </mesh>
        <mesh castShadow position={[0, 1.48, 0]}>
          <sphereGeometry args={[0.38, 12, 8]} />
          <meshStandardMaterial color="#F2C89F" flatShading />
        </mesh>
        <mesh castShadow position={[0, 2.02, -0.03]}>
          <coneGeometry args={[0.55, 0.95, 8]} />
          <meshStandardMaterial color="#3F307E" flatShading />
        </mesh>
        <mesh castShadow position={[0.43, 1.02, 0.05]} rotation={[0, 0, -0.42]}>
          <cylinderGeometry args={[0.04, 0.04, 1.35, 6]} />
          <meshStandardMaterial color="#7A4F32" flatShading />
        </mesh>
        <mesh castShadow position={[0.67, 1.66, 0.12]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#8DF7FF" emissive="#54C8E8" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 2.72, 0]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial color={markerColor} emissive={markerColor} emissiveIntensity={0.45} />
        </mesh>
        <CuboidCollider args={[0.55, 1.05, 0.55]} position={[0, 1, 0]} />
        <Html center position={[0, 2.95, 0]} distanceFactor={16} transform occlude>
          <div className="world-label">{npc.name}</div>
        </Html>
      </group>
    </RigidBody>
  );
}
