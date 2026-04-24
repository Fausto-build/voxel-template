import { useMemo } from "react";
import { CylinderCollider, RigidBody, CuboidCollider } from "@react-three/rapier";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { getTheme } from "../utils/configLoader";
import type { TerrainConfig, WorldPathConfig } from "../types/world.types";

type TerrainProps = {
  terrain: TerrainConfig;
  themeId: string;
  paths?: WorldPathConfig[];
};

function buildDisplacedCylinder(
  radius: number,
  segments: number,
  amplitude: number,
  seed: number,
): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const rings = 18;

  const hash = (x: number, z: number) => {
    const n = Math.sin(x * 127.1 + z * 311.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  const noise = (x: number, z: number) => {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const ux = fx * fx * (3 - 2 * fx);
    const uz = fz * fz * (3 - 2 * fz);

    return (
      hash(ix, iz) * (1 - ux) * (1 - uz) +
      hash(ix + 1, iz) * ux * (1 - uz) +
      hash(ix, iz + 1) * (1 - ux) * uz +
      hash(ix + 1, iz + 1) * ux * uz
    ) * 2 - 1;
  };

  const getY = (r: number, angle: number) => {
    const nx = Math.cos(angle) * r * 0.4;
    const nz = Math.sin(angle) * r * 0.4;
    const edgeFalloff = Math.max(0, 1 - r / radius);
    return noise(nx, nz) * amplitude * edgeFalloff * edgeFalloff;
  };

  for (let ring = 0; ring <= rings; ring++) {
    const r = (ring / rings) * radius;
    const v = ring / rings;

    for (let seg = 0; seg <= segments; seg++) {
      const angle = (seg / segments) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = ring < rings ? getY(r, angle) : 0;

      positions.push(x, y, z);
      normals.push(0, 1, 0);
      uvs.push(x / radius * 0.5 + 0.5, z / radius * 0.5 + 0.5);
    }
  }

  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * (segments + 1) + seg;
      const b = a + segments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

function IslandTerrain({ terrain, themeId, paths }: TerrainProps) {
  const theme = getTheme(themeId);
  const radius = terrain.size[0] / 2;
  const beachRadius = radius * 0.92;
  const grassRadius = radius * 0.72;
  const groundColor = terrain.groundColor ?? theme.groundColor;
  const sandColor = terrain.sandColor ?? theme.sandColor;
  const amplitude = terrain.height ?? 1;

  const grassGeo = useMemo(
    () => buildDisplacedCylinder(grassRadius, 48, amplitude * 0.55, 42),
    [grassRadius, amplitude],
  );
  const beachGeo = useMemo(
    () => buildDisplacedCylinder(beachRadius, 48, amplitude * 0.18, 13),
    [beachRadius, amplitude],
  );

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Sandy beach ring */}
      <mesh receiveShadow position={[0, -0.34, 0]}>
        <cylinderGeometry args={[beachRadius, radius, 0.7, 48]} />
        <meshStandardMaterial color={sandColor} flatShading />
      </mesh>
      {/* Shore blend — subtle second beach layer */}
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <cylinderGeometry args={[grassRadius * 1.14, beachRadius * 0.98, 0.22, 42]} />
        <meshStandardMaterial color={sandColor} flatShading />
      </mesh>
      {/* Grass with vertex displacement */}
      <mesh receiveShadow geometry={grassGeo}>
        <meshStandardMaterial color={groundColor} flatShading />
      </mesh>
      {paths?.map((path) =>
        path.points.length > 1
          ? path.points.slice(0, -1).map((pt, i) => {
              const next = path.points[i + 1];
              const dx = next[0] - pt[0];
              const dz = next[2] - pt[2];
              const len = Math.sqrt(dx * dx + dz * dz);
              const cx = (pt[0] + next[0]) / 2;
              const cz = (pt[2] + next[2]) / 2;
              const angle = Math.atan2(dx, dz);

              return (
                <mesh
                  key={`${path.id}-${i}`}
                  receiveShadow
                  position={[cx, 0.01, cz]}
                  rotation={[-Math.PI / 2, 0, angle]}
                >
                  <planeGeometry args={[0.9, len]} />
                  <meshStandardMaterial color="#C4A86A" roughness={0.95} flatShading />
                </mesh>
              );
            })
          : null,
      )}
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

function CityTerrain({ terrain, themeId, paths }: TerrainProps) {
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
      {/* Config-driven road paths */}
      {paths?.map((path) =>
        path.points.length > 1
          ? path.points.slice(0, -1).map((pt, i) => {
              const next = path.points[i + 1];
              const dx = next[0] - pt[0];
              const dz = next[2] - pt[2];
              const len = Math.sqrt(dx * dx + dz * dz);
              const cx = (pt[0] + next[0]) / 2;
              const cz = (pt[2] + next[2]) / 2;
              const angle = Math.atan2(dx, dz);

              return (
                <mesh
                  key={`${path.id}-${i}`}
                  receiveShadow
                  position={[cx, 0.03, cz]}
                  rotation={[-Math.PI / 2, 0, angle]}
                >
                  <planeGeometry args={[3.2, len]} />
                  <meshStandardMaterial color="#252525" roughness={0.8} />
                </mesh>
              );
            })
          : null,
      )}
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

export function Terrain({ terrain, themeId, paths }: TerrainProps) {
  switch (terrain.type) {
    case "island":
      return <IslandTerrain terrain={terrain} themeId={themeId} paths={paths} />;
    case "flat":
      return <FlatTerrain terrain={terrain} themeId={themeId} />;
    case "city":
      return <CityTerrain terrain={terrain} themeId={themeId} paths={paths} />;
    case "sandbox":
      return <SandboxTerrain terrain={terrain} themeId={themeId} />;
    default:
      return <IslandTerrain terrain={terrain} themeId={themeId} paths={paths} />;
  }
}

export function terrainHasWater(terrain: TerrainConfig): boolean {
  return terrain.type === "island";
}
