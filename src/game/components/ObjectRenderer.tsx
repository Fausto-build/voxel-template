import { CuboidCollider, RigidBody } from "@react-three/rapier";
import objectsConfig from "../config/objects.config.json";
import type { WorldObjectConfig } from "../types/world.types";

type ObjectRendererProps = {
  object: WorldObjectConfig;
};

type ObjectDef = {
  collider: { type: string; args: number[]; offset: number[] } | null;
  instanced?: boolean;
};

const DEFAULT_TREE_GREEN = "#34A853";
const DEFAULT_WOOD = "#8B5A33";
const DEFAULT_STONE = "#A8A9B4";

export function ObjectRenderer({ object }: ObjectRendererProps) {
  const rotation = object.rotation ?? [0, 0, 0];
  const scale = object.scale ?? [1, 1, 1];
  const def = (objectsConfig as Record<string, ObjectDef>)[object.type];

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={object.position}
      rotation={rotation}
      scale={scale}
    >
      <Primitive object={object} />
      {def?.collider && (
        <CuboidCollider
          args={def.collider.args as [number, number, number]}
          position={def.collider.offset as [number, number, number]}
        />
      )}
    </RigidBody>
  );
}

function Primitive({ object }: ObjectRendererProps) {
  switch (object.type) {
    case "tree":
      return <Tree color={object.color} />;
    case "rock":
      return <Rock color={object.color} />;
    case "castle":
      return <Castle color={object.color} />;
    case "bridge":
      return <Bridge color={object.color} />;
    case "house":
      return <House color={object.color} />;
    case "fence":
      return <Fence color={object.color} />;
    case "sign":
      return <Sign color={object.color} />;
    case "chest":
      return <Chest color={object.color} />;
    case "tower":
      return <Tower color={object.color} />;
    default:
      return <Fallback color={object.color} />;
  }
}

function Tree({ color = DEFAULT_TREE_GREEN }: { color?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.28, 0.38, 1.6, 7]} />
        <meshStandardMaterial color={DEFAULT_WOOD} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2, 0]}>
        <coneGeometry args={[1.1, 1.9, 7]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.85, 0]}>
        <coneGeometry args={[0.78, 1.55, 7]} />
        <meshStandardMaterial color="#2E8F49" flatShading />
      </mesh>
    </group>
  );
}

function Rock({ color = "#8D93A5" }: { color?: string }) {
  return (
    <mesh castShadow receiveShadow position={[0, 0.55, 0]} rotation={[0.2, 0.5, -0.12]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

function Castle({ color = DEFAULT_STONE }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[5.4, 2, 4.6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.55, -2.34]}>
        <boxGeometry args={[1.2, 1.1, 0.12]} />
        <meshStandardMaterial color="#634832" flatShading />
      </mesh>
      {[
        [-2.8, 1.45, -2.35],
        [2.8, 1.45, -2.35],
        [-2.8, 1.45, 2.35],
        [2.8, 1.45, 2.35],
      ].map((position) => (
        <group key={position.join(",")} position={position as [number, number, number]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 0.9, 2.9, 8]} />
            <meshStandardMaterial color="#B6B8C4" flatShading />
          </mesh>
          <mesh castShadow position={[0, 1.75, 0]}>
            <coneGeometry args={[1.05, 1.3, 8]} />
            <meshStandardMaterial color="#7D66D9" flatShading />
          </mesh>
        </group>
      ))}
      {[-1.6, 0, 1.6].map((x) => (
        <mesh key={x} castShadow position={[x, 2.25, -2.35]}>
          <boxGeometry args={[0.65, 0.55, 0.45]} />
          <meshStandardMaterial color="#E5E4EA" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Bridge({ color = "#A36B3F" }: { color?: string }) {
  return (
    <group>
      {[-2.5, -1.25, 0, 1.25, 2.5].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.25, 0]}>
          <boxGeometry args={[0.95, 0.22, 7]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
      {[-3.15, 3.15].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.9, 0]}>
          <boxGeometry args={[0.18, 0.34, 7.4]} />
          <meshStandardMaterial color="#6B4329" flatShading />
        </mesh>
      ))}
      {[-2.8, 2.8].map((x) =>
        [-2.9, 2.9].map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.55, z]}>
            <boxGeometry args={[0.22, 0.9, 0.22]} />
            <meshStandardMaterial color="#6B4329" flatShading />
          </mesh>
        )),
      )}
    </group>
  );
}

function House({ color = "#FFE0A6" }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.8, 1.8, 2.5]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.25, 1.3, 4]} />
        <meshStandardMaterial color="#E85D4F" flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.58, -1.27]}>
        <boxGeometry args={[0.62, 1.1, 0.08]} />
        <meshStandardMaterial color="#6C4938" flatShading />
      </mesh>
    </group>
  );
}

function Fence({ color = "#A36B3F" }: { color?: string }) {
  return (
    <group>
      {[-2, -1, 0, 1, 2].map((x) => (
        <mesh key={x} castShadow position={[x, 0.55, 0]}>
          <boxGeometry args={[0.14, 1.1, 0.14]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
      {[0.35, 0.75].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]}>
          <boxGeometry args={[4.4, 0.12, 0.12]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Sign({ color = "#B67A3D" }: { color?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.58, 0]}>
        <boxGeometry args={[0.18, 1.15, 0.18]} />
        <meshStandardMaterial color="#6B4329" flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.25, -0.03]}>
        <boxGeometry args={[1.25, 0.62, 0.12]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function Chest({ color = "#8B4F2E" }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.35, 0.76, 0.9]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 1.38, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#B8783A" flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.48, -0.47]}>
        <boxGeometry args={[0.26, 0.34, 0.06]} />
        <meshStandardMaterial color="#FFD95C" flatShading />
      </mesh>
    </group>
  );
}

function Tower({ color = DEFAULT_STONE }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.1, 1.25, 3, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh castShadow position={[0, 3.45, 0]}>
        <coneGeometry args={[1.45, 1.4, 8]} />
        <meshStandardMaterial color="#7D66D9" flatShading />
      </mesh>
    </group>
  );
}

function Fallback({ color = "#FFCF7A" }: { color?: string }) {
  return (
    <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}
