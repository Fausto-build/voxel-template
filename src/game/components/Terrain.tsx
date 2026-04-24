import { CylinderCollider, RigidBody, CuboidCollider } from "@react-three/rapier";
import { getTheme } from "../utils/configLoader";
import type { TerrainConfig } from "../types/world.types";

type TerrainProps = {
  terrain: TerrainConfig;
  themeId: string;
};

function IslandTerrain({ terrain, themeId }: TerrainProps) {
  const theme = getTheme(themeId);
  const radius = terrain.size[0] / 2;
  const beachRadius = radius * 0.92;
  const grassRadius = radius * 0.72;
  const groundColor = terrain.groundColor ?? theme.groundColor;
  const sandColor = terrain.sandColor ?? theme.sandColor;

  return (
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
  );
}

function FlatTerrain({ terrain, themeId }: TerrainProps) {
  const theme = getTheme(themeId);
  const [w, h] = terrain.size;
  const groundColor = terrain.groundColor ?? theme.groundColor;

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={groundColor} flatShading />
      </mesh>
      <CuboidCollider args={[w / 2, 0.1, h / 2]} position={[0, -0.1, 0]} />
    </RigidBody>
  );
}

function CityTerrain({ terrain, themeId }: TerrainProps) {
  const theme = getTheme(themeId);
  const [w, h] = terrain.size;
  const groundColor = terrain.groundColor ?? "#3A3A3A";
  const sidewalkColor = terrain.sandColor ?? theme.sandColor ?? "#888888";

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Asphalt base */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={groundColor} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Sidewalk border strip */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[w * 0.96, h * 0.96]} />
        <meshStandardMaterial color={sidewalkColor} roughness={0.9} />
      </mesh>
      {/* Road surface on top */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[w * 0.82, h * 0.82]} />
        <meshStandardMaterial color={groundColor} roughness={0.8} metalness={0.08} />
      </mesh>
      <CuboidCollider args={[w / 2, 0.1, h / 2]} position={[0, -0.1, 0]} />
    </RigidBody>
  );
}

function SandboxTerrain({ terrain, themeId }: TerrainProps) {
  const theme = getTheme(themeId);
  const [w, h] = terrain.size;
  const groundColor = terrain.groundColor ?? theme.groundColor;

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={groundColor} flatShading />
      </mesh>
      <CuboidCollider args={[w / 2, 0.1, h / 2]} position={[0, -0.1, 0]} />
    </RigidBody>
  );
}

export function Terrain({ terrain, themeId }: TerrainProps) {
  switch (terrain.type) {
    case "island":
      return <IslandTerrain terrain={terrain} themeId={themeId} />;
    case "flat":
      return <FlatTerrain terrain={terrain} themeId={themeId} />;
    case "city":
      return <CityTerrain terrain={terrain} themeId={themeId} />;
    case "sandbox":
      return <SandboxTerrain terrain={terrain} themeId={themeId} />;
    default:
      return <IslandTerrain terrain={terrain} themeId={themeId} />;
  }
}

export function terrainHasWater(terrain: TerrainConfig): boolean {
  return terrain.type === "island";
}
