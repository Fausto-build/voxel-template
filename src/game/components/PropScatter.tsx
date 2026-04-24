import { useMemo } from "react";
import { ObjectRenderer } from "./ObjectRenderer";
import type { PropScatterEntry, WorldObjectConfig } from "../types/world.types";

type PropScatterProps = {
  props: PropScatterEntry[];
  seed?: number;
};

function seededRand(seed: number) {
  let s = seed;

  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildObjects(props: PropScatterEntry[], seed: number): WorldObjectConfig[] {
  const rand = seededRand(seed);
  const objects: WorldObjectConfig[] = [];

  for (const entry of props) {
    const jitter = entry.jitter ?? 1;
    const minScale = entry.minScale ?? 0.85;
    const maxScale = entry.maxScale ?? 1.2;
    const half = entry.area / 2;

    for (let i = 0; i < entry.count; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * half;
      const x = Math.cos(angle) * dist + (rand() - 0.5) * jitter * 2;
      const z = Math.sin(angle) * dist + (rand() - 0.5) * jitter * 2;
      const s = minScale + rand() * (maxScale - minScale);
      const rotY = rand() * Math.PI * 2;

      objects.push({
        id: `scatter_${entry.kind}_${i}`,
        type: entry.kind,
        position: [x, 0, z],
        rotation: [0, rotY, 0],
        scale: [s, s * (0.9 + rand() * 0.2), s],
        color: entry.color,
      });
    }
  }

  return objects;
}

export function PropScatter({ props, seed = 77331 }: PropScatterProps) {
  const objects = useMemo(() => buildObjects(props, seed), [props, seed]);

  return (
    <>
      {objects.map((obj) => (
        <ObjectRenderer key={obj.id} object={obj} />
      ))}
    </>
  );
}
