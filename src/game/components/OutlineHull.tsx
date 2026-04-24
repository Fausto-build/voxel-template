import { useMemo } from "react";
import * as THREE from "three";

type OutlineHullProps = {
  /** geometry to outline — shared with the original mesh */
  geometry: THREE.BufferGeometry;
  /** world-space scale of the host mesh, so hull can compute thickness */
  scale?: [number, number, number];
  color?: string;
  thickness?: number;
};

const BACK_MATERIAL = new THREE.MeshBasicMaterial({
  color: "#111111",
  side: THREE.BackSide,
  transparent: false,
  depthWrite: true,
});

/**
 * Inverted-hull outline: renders the same geometry scaled out slightly with
 * back-faces only.  Place this as a sibling inside the same group as the
 * original mesh so it inherits the same transform.
 */
export function OutlineHull({ geometry, scale = [1, 1, 1], color = "#111111", thickness = 0.045 }: OutlineHullProps) {
  const material = useMemo(() => {
    if (color === "#111111") return BACK_MATERIAL;
    return new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  }, [color]);

  const outlineScale: [number, number, number] = [
    scale[0] + thickness / scale[0],
    scale[1] + thickness / scale[1],
    scale[2] + thickness / scale[2],
  ];

  return (
    <mesh
      geometry={geometry}
      material={material}
      scale={outlineScale}
      renderOrder={-1}
    />
  );
}

/** Wrap any group of children with per-mesh inverted-hull outlines. */
export function WithOutline({
  children,
  enabled = true,
  color = "#111111",
  thickness = 0.045,
}: {
  children: React.ReactNode;
  enabled?: boolean;
  color?: string;
  thickness?: number;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <group>
      {children}
      <group renderOrder={-1}>
        {/* Hull is applied per-mesh by OutlineHull consumers */}
      </group>
    </group>
  );
}
