import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { WorldObjectConfig } from "../types/world.types";

type InstancedObjectRendererProps = {
  objects: WorldObjectConfig[];
  type: string;
};

type MeshSpec = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  localPosition: [number, number, number];
  localRotation?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const DEFAULT_WOOD = "#8B5A33";
const DEFAULT_TREE_GREEN = "#34A853";
const DEFAULT_STONE = "#A8A9B4";
const DEFAULT_WOOD_FENCE = "#A36B3F";
const DEFAULT_SIGN_POST = "#6B4329";
const DEFAULT_SIGN_BOARD = "#B67A3D";

function buildTreeSpecs(color: string): MeshSpec[] {
  return [
    {
      geometry: new THREE.CylinderGeometry(0.28, 0.38, 1.6, 7),
      material: new THREE.MeshStandardMaterial({ color: DEFAULT_WOOD, flatShading: true }),
      localPosition: [0, 0.8, 0],
      castShadow: true,
    },
    {
      geometry: new THREE.ConeGeometry(1.1, 1.9, 7),
      material: new THREE.MeshStandardMaterial({ color, flatShading: true }),
      localPosition: [0, 2, 0],
      castShadow: true,
    },
    {
      geometry: new THREE.ConeGeometry(0.78, 1.55, 7),
      material: new THREE.MeshStandardMaterial({ color: "#2E8F49", flatShading: true }),
      localPosition: [0, 2.85, 0],
      castShadow: true,
    },
  ];
}

function buildRockSpecs(color: string): MeshSpec[] {
  return [
    {
      geometry: new THREE.DodecahedronGeometry(1, 0),
      material: new THREE.MeshStandardMaterial({ color, flatShading: true }),
      localPosition: [0, 0.55, 0],
      localRotation: [0.2, 0.5, -0.12],
      castShadow: true,
      receiveShadow: true,
    },
  ];
}

function buildFenceSpecs(color: string): MeshSpec[] {
  const mat = new THREE.MeshStandardMaterial({ color, flatShading: true });
  const postGeo = new THREE.BoxGeometry(0.14, 1.1, 0.14);
  const railGeo = new THREE.BoxGeometry(4.4, 0.12, 0.12);
  const specs: MeshSpec[] = [];
  for (const x of [-2, -1, 0, 1, 2]) {
    specs.push({ geometry: postGeo, material: mat, localPosition: [x, 0.55, 0], castShadow: true });
  }
  for (const y of [0.35, 0.75]) {
    specs.push({ geometry: railGeo, material: mat, localPosition: [0, y, 0], castShadow: true });
  }
  return specs;
}

function buildSignSpecs(color: string): MeshSpec[] {
  return [
    {
      geometry: new THREE.BoxGeometry(0.18, 1.15, 0.18),
      material: new THREE.MeshStandardMaterial({ color: DEFAULT_SIGN_POST, flatShading: true }),
      localPosition: [0, 0.58, 0],
      castShadow: true,
    },
    {
      geometry: new THREE.BoxGeometry(1.25, 0.62, 0.12),
      material: new THREE.MeshStandardMaterial({ color, flatShading: true }),
      localPosition: [0, 1.25, -0.03],
      castShadow: true,
    },
  ];
}

function getMeshSpecs(type: string, defaultColor: string): MeshSpec[] {
  switch (type) {
    case "tree":
      return buildTreeSpecs(defaultColor || DEFAULT_TREE_GREEN);
    case "rock":
      return buildRockSpecs(defaultColor || DEFAULT_STONE);
    case "fence":
      return buildFenceSpecs(defaultColor || DEFAULT_WOOD_FENCE);
    case "sign":
      return buildSignSpecs(defaultColor || DEFAULT_SIGN_BOARD);
    default:
      return [];
  }
}

function useInstancedMeshes(objects: WorldObjectConfig[], type: string) {
  const firstColor = objects[0]?.color ?? "";
  const specs = useMemo(() => getMeshSpecs(type, firstColor), [type, firstColor]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    for (let si = 0; si < specs.length; si++) {
      const mesh = refs.current[si];
      if (!mesh) continue;

      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        const [lx, ly, lz] = specs[si].localPosition;
        const rot = obj.rotation ?? [0, 0, 0];
        const scale = obj.scale ?? [1, 1, 1];

        dummy.position.set(obj.position[0], obj.position[1], obj.position[2]);
        dummy.rotation.set(rot[0], rot[1], rot[2]);
        dummy.scale.set(scale[0], scale[1], scale[2]);
        dummy.updateMatrix();

        // Apply local sub-mesh offset in parent-local space
        const localOffset = new THREE.Vector3(lx, ly, lz);
        localOffset.applyEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
        localOffset.multiply(new THREE.Vector3(...scale));

        dummy.position.set(
          obj.position[0] + localOffset.x,
          obj.position[1] + localOffset.y,
          obj.position[2] + localOffset.z,
        );

        if (specs[si].localRotation) {
          const lr = specs[si].localRotation!;
          dummy.rotation.set(rot[0] + lr[0], rot[1] + lr[1], rot[2] + lr[2]);
        } else {
          dummy.rotation.set(rot[0], rot[1], rot[2]);
        }

        dummy.scale.set(scale[0], scale[1], scale[2]);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        if (obj.color && mesh.instanceColor) {
          mesh.setColorAt(i, new THREE.Color(obj.color));
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [objects, specs]);

  return { specs, refs };
}

export function InstancedObjectRenderer({ objects, type }: InstancedObjectRendererProps) {
  const { specs, refs } = useInstancedMeshes(objects, type);

  if (objects.length === 0 || specs.length === 0) {
    return null;
  }

  return (
    <>
      {specs.map((spec, si) => (
        <instancedMesh
          key={si}
          ref={(el) => { refs.current[si] = el; }}
          args={[spec.geometry, spec.material, objects.length]}
          castShadow={spec.castShadow}
          receiveShadow={spec.receiveShadow}
        />
      ))}
    </>
  );
}
