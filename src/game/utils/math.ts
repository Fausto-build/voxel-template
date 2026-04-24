import * as THREE from "three";
import type { Vector3Tuple, WorldObjectConfig } from "../types/world.types";

export function toVector3(tuple: Vector3Tuple): THREE.Vector3 {
  return new THREE.Vector3(tuple[0], tuple[1], tuple[2]);
}

export function fromVector3(vector: THREE.Vector3): Vector3Tuple {
  return [vector.x, vector.y, vector.z];
}

export function distance2D(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export function distance3D(a: Vector3Tuple, b: Vector3Tuple): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampToIsland(position: Vector3Tuple, radius: number): Vector3Tuple {
  const x = position[0];
  const z = position[2];
  const length = Math.sqrt(x * x + z * z);

  if (length <= radius) {
    return position;
  }

  const scale = radius / length;
  return [x * scale, position[1], z * scale];
}

export function objectCollisionRadius(object: WorldObjectConfig): number {
  const scale = object.scale ?? [1, 1, 1];

  switch (object.type) {
    case "castle":
      return 5.5 * Math.max(scale[0], scale[2]);
    case "house":
      return 2.8 * Math.max(scale[0], scale[2]);
    case "tower":
      return 2 * Math.max(scale[0], scale[2]);
    case "tree":
      return 1.25 * Math.max(scale[0], scale[2]);
    case "rock":
      return 1.3 * Math.max(scale[0], scale[2]);
    case "chest":
      return 1.1 * Math.max(scale[0], scale[2]);
    default:
      return 0;
  }
}

export function resolveObjectCollisions(
  position: Vector3Tuple,
  objects: WorldObjectConfig[],
  actorRadius: number,
): Vector3Tuple {
  let next: Vector3Tuple = [...position];

  for (const object of objects) {
    const obstacleRadius = objectCollisionRadius(object);

    if (obstacleRadius <= 0) {
      continue;
    }

    const dx = next[0] - object.position[0];
    const dz = next[2] - object.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    const minDistance = obstacleRadius + actorRadius;

    if (distance > 0.0001 && distance < minDistance) {
      const push = (minDistance - distance) / distance;
      next = [next[0] + dx * push, next[1], next[2] + dz * push];
    }
  }

  return next;
}

export function normalizeAngle(radians: number): number {
  let angle = radians;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}
