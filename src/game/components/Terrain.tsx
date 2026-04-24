import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { WATER_LEVEL } from "../core/constants";
import { getTheme } from "../utils/configLoader";
import type { TerrainConfig } from "../types/world.types";

type TerrainProps = {
  terrain: TerrainConfig;
  themeId: string;
};

export function Terrain({ terrain, themeId }: TerrainProps) {
  const theme = getTheme(themeId);
  const radius = terrain.size[0] / 2;
  const beachRadius = radius * 0.92;
  const grassRadius = radius * 0.72;
  const groundColor = terrain.groundColor ?? theme.groundColor;
  const sandColor = terrain.sandColor ?? theme.sandColor;
  const waterColor = terrain.waterColor ?? theme.waterColor;

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <mesh receiveShadow position={[0, -0.34, 0]}>
          <cylinderGeometry args={[beachRadius, radius, 0.7, 48]} />
          <meshStandardMaterial color={sandColor} flatShading />
        </mesh>
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[grassRadius, grassRadius * 1.03, 0.38, 42]} />
          <meshStandardMaterial color={groundColor} flatShading />
        </mesh>
        <CylinderCollider args={[0.25, grassRadius]} position={[0, 0, 0]} />
        <CylinderCollider args={[0.2, beachRadius]} position={[0, -0.2, 0]} />
      </RigidBody>

      <mesh receiveShadow position={[-1.5, 0.05, -11]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[6, 0.04, 18]} />
        <meshStandardMaterial color={waterColor} roughness={0.55} metalness={0.02} />
      </mesh>

      <mesh receiveShadow position={[11, 0.08, 12]} rotation={[0, -0.35, 0]}>
        <cylinderGeometry args={[5.8, 5.8, 0.06, 24]} />
        <meshStandardMaterial color={waterColor} roughness={0.6} metalness={0.02} />
      </mesh>

      <mesh receiveShadow position={[0, WATER_LEVEL, 0]}>
        <cylinderGeometry args={[radius * 1.9, radius * 1.9, 0.05, 72]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.72} roughness={0.3} />
      </mesh>
    </group>
  );
}
